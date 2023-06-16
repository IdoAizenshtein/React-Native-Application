import React, { PureComponent } from 'react'
import {
  Animated,
  Dimensions,
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
import { withTranslation } from 'react-i18next'
import { colors, fonts } from '../../../styles/vars'
import styles from '../CashFlowStyles'
import CustomIcon from '../../../components/Icons/Fontello'
import {
  combineStyles as cs,
  getFormattedValueArray,
  goTo,
  sp,
} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import AccountIcon from '../../../components/AccountIcon/AccountIcon'
import AppTimezone from '../../../utils/appTimezone'
import CheckList from './CheckList'
import { Calendar } from 'react-native-calendars'
import { Icon } from 'react-native-elements'
import Api from '../../../api/Api'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { IS_IOS } from '../../../constants/common'
import CategoriesModal from 'src/components/CategoriesModal/CategoriesModal'
import {
  createAccountCflTransTypeApi,
  existingCheckApi,
  getMutavApi,
  removeAccountCflTransTypeApi,
} from '../../../api'
import { connect } from 'react-redux'
import {
  setPopAddCashShow,
  setPopAddCheckShow,
} from '../../../redux/actions/user'
import Loader from 'src/components/Loader/Loader'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import {
  ActionSheet,
  ActionSheetItem,
} from 'react-native-action-sheet-component'
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
  showPopAlertCash: state.showPopAlertCash,
  showPopAlertCheck: state.showPopAlertCheck,
}))
@withTranslation()
export default class CreatePayment extends PureComponent {
  today = AppTimezone.moment().valueOf()

  constructor (props) {
    super(props)

    const objParamas = props.route.params.objParamas

    // const paymentList = JSON.parse(JSON.stringify(this.props.searchkey.filter((it) => it.showInDrop))).map((it) => {
    //   return {
    //     text: it.name,
    //     id: it.paymentDescription,
    //     selected: false,
    //   }
    // })

    this.state = {
      fadeAnim: new Animated.Value(1),
      showAlert: (!objParamas && props.showPopAlertCash),
      fadeAnimCheck: new Animated.Value(0),
      showAlertCheck: false,
      idxObj: (objParamas && objParamas.idxObj !== undefined &&
        objParamas.idxObj !== null) ? objParamas.idxObj : 0,
      obj: (objParamas) ? (objParamas.obj) : {
        'companyAccountId': (props.selectedAccountIds.length === 1)
          ? props.accounts.find(a => a.companyAccountId ===
            props.selectedAccountIds[0]).companyAccountId
          : null,
        'companyId': props.currentCompanyId,
        'deleteOldExcel': false,
        'receiptTypeId': props.dataTypePayments,
        'sourceProgramId': null,
        'targetType': null,
        'biziboxMutavId': null,
        'transes': [
          {
            'asmachta': '',
            'asmachtaExist': null,
            'dueDate': this.today,
            'paymentDesc': null,
            'total': null,
            'transTypeId': {
              companyId: '00000000-0000-0000-0000-000000000000',
              createDefaultSupplier: true,
              iconType: 'No category',
              shonaScreen: true,
              transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
              transTypeName: 'ללא קטגוריה 1',
            },
          },
        ],
      },
      saveOriginObj: {},
      expirationDate: null,
      editModalInsideIsOpen: false,
      timesValue: 0,
      tab: 1,
      editSum: false,
      titleModalInside: '',
      transDate: null,
      dataTypePaymentsGroup: {},
      paymentList: [
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
      ],
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
        {
          text: 'שנתי',
          id: 'YEAR',
          selected: false,
        },
      ],
      dataList: [],
      typeEditModal: null,
      categoriesModalIsOpen: false,
      currentEditBankTrans: null,
      companyAccountIdNoValid: false,
      totalNoValid: false,
      paymentDescValid: false,
      targetTypeValid: false,
      biziboxMutavValid: true,
      biziboxMutavList: [],
      biziboxMutavListFilter: [],
      modalMutavListShow: false,
      currentMutav: '',
      inProgressMutavList: false,
      addMutavModal: false,
      mutavRow: null,
    }

    if (this.props.route.params.objParamas) {
      delete this.props.route.params.objParamas
    }
  }

  componentDidMount () {
    getMutavApi.post({ body: { uuid: this.props.currentCompanyId } })
      .then(data => {
        this.setState({
          currentMutav: '',
          biziboxMutavList: data,
        })
      })
  }

  update = () => {
    const { closeModalCreatePayments, updateRow } = this.props
    const params = this.state.obj
    let valuesSave = Object.assign({}, params)
    let isValid = true
    this.setState({
      biziboxMutavValid: valuesSave.biziboxMutavId !== null,
      targetTypeValid: valuesSave.targetType === null ||
        valuesSave.targetType === '',
      companyAccountIdNoValid: valuesSave.companyAccountId === null ||
        valuesSave.companyAccountId === '',
      totalNoValid: valuesSave.transes[this.state.idxObj].total === null ||
        valuesSave.transes[this.state.idxObj].total === '',
      paymentDescValid: valuesSave.transes[this.state.idxObj].paymentDesc ===
        null || valuesSave.transes[this.state.idxObj].paymentDesc === '',
    })
    if (this.state.idxObj !== valuesSave.transes.length - 1) {
      valuesSave.transes.forEach((itemInside, idx) => {
        if ((valuesSave.transes.length > (idx + 1)) &&
          (itemInside.paymentDesc === null || itemInside.paymentDesc === '' ||
            itemInside.total === null || itemInside.total === '')) {
          isValid = false
        }
      })
      if (isValid) {
        valuesSave.transes.splice(valuesSave.transes.length - 1, 1)
      }
    } else {
      valuesSave.transes.forEach((itemInside) => {
        if (itemInside.paymentDesc === null || itemInside.paymentDesc === '' ||
          itemInside.total === null || itemInside.total === '') {
          isValid = false
        }
      })
    }

    if (valuesSave.companyAccountId && valuesSave.targetType && isValid) {
      valuesSave.transes.forEach((itemInside) => {
        itemInside.dueDate = AppTimezone.moment(itemInside.dueDate).valueOf()
        delete itemInside.asmachtaExist
        itemInside.transTypeId = itemInside.transTypeId.transTypeId
      })
    } else {
      return
    }
    // //console.log(valuesSave)
    new Api({ endpoint: 'payments/cfl/create' }).post({
      body: valuesSave,
    }).then(data => {
      closeModalCreatePayments()
      setTimeout(() => {
        updateRow()
      }, 10)
    }).catch(() => {
    })
  }

  removePayments = (index) => () => {
    // ////console.log(index)
    let valuesSave = Object.assign({}, this.state.obj)
    valuesSave.transes.splice(index, 1)
    this.setState({
      idxObj: (valuesSave.transes.length - 1),
      obj: valuesSave,
    })
  }

  addPayments = () => {
    const params = this.state.obj
    this.setState({
      targetTypeValid: params.targetType === null || params.targetType === '',
      companyAccountIdNoValid: params.companyAccountId === null ||
        params.companyAccountId === '',
      totalNoValid: params.transes[this.state.idxObj].total === null ||
        params.transes[this.state.idxObj].total === '',
      paymentDescValid: params.transes[this.state.idxObj].paymentDesc ===
        null || params.transes[this.state.idxObj].paymentDesc === '',
    })
    if (this.state.idxObj !== params.transes.length - 1) {
      let isValid = true
      params.transes.forEach((itemInside, idx) => {
        if ((params.transes.length > (idx + 1)) &&
          (itemInside.paymentDesc === null || itemInside.paymentDesc === '' ||
            itemInside.total === null || itemInside.total === '')) {
          isValid = false
        }
      })
      if (params.companyAccountId && params.targetType && isValid) {
        let valuesSave = Object.assign({}, params)
        valuesSave.transes[valuesSave.transes.length - 1] = {
          ...valuesSave.transes[valuesSave.transes.length - 2],
          asmachta: (valuesSave.transes[valuesSave.transes.length - 2].asmachta)
            ? String(Number(
              valuesSave.transes[valuesSave.transes.length - 2].asmachta) + 1)
            : '',
          dueDate: AppTimezone.moment(
            valuesSave.transes[valuesSave.transes.length - 2].dueDate)
            .add(1, 'month')
            .valueOf(),
        }
        this.setState({
          idxObj: (valuesSave.transes.length - 1),
          obj: valuesSave,
        })
        // //console.log(this.state.obj)
      }
    } else {
      let isValid = true
      params.transes.forEach((itemInside) => {
        if (itemInside.paymentDesc === null || itemInside.paymentDesc === '' ||
          itemInside.total === null || itemInside.total === '') {
          isValid = false
        }
      })

      if (params.companyAccountId && params.targetType && isValid) {
        let valuesSave = Object.assign({}, params)
        valuesSave.transes.push({
          ...valuesSave.transes[valuesSave.transes.length - 1],
          asmachta: (valuesSave.transes[valuesSave.transes.length - 1].asmachta)
            ? String(Number(
              valuesSave.transes[valuesSave.transes.length - 1].asmachta) + 1)
            : '',
          dueDate: AppTimezone.moment(
            valuesSave.transes[valuesSave.transes.length - 1].dueDate)
            .add(1, 'month')
            .valueOf(),
        })
        this.setState({
          idxObj: (this.state.idxObj + 1),
          obj: valuesSave,
        })
        // //console.log(this.state.obj)
        setTimeout(() => this.scrollView.scrollToEnd({ animated: true }), 200)
      }
    }
  }

  editPayment = (index) => () => {
    // const params = this.state.obj
    // this.setState({
    //   targetTypeValid: params.targetType === null || params.targetType === '',
    //   companyAccountIdNoValid: params.companyAccountId === null || params.companyAccountId === '',
    //   totalNoValid: params.transes[this.state.idxObj].total === null || params.transes[this.state.idxObj].total === '',
    //   paymentDescValid: params.transes[this.state.idxObj].paymentDesc === null || params.transes[this.state.idxObj].paymentDesc === '',
    // })
    // let isValid = true
    //
    // params.transes.forEach((itemInside, idx) => {
    //   if ((params.transes.length > (idx + 1)) && (itemInside.paymentDesc === null || itemInside.paymentDesc === '' || itemInside.total === null || itemInside.total === '')) {
    //     isValid = false
    //   }
    // })
    // if (params.companyAccountId && params.targetType && isValid) {
    //   this.setState({ idxObj: index })
    // }
  }

  isValidList () {
    const params = this.state.obj

    let isValid = true

    if (this.state.idxObj !== (params.transes.length - 1)) {
      params.transes.forEach((itemInside, idx) => {
        if ((params.transes.length > (idx + 1)) &&
          (itemInside.paymentDesc === null || itemInside.paymentDesc === '' ||
            itemInside.total === null || itemInside.total === '')) {
          isValid = false
        }
      })
    } else {
      params.transes.forEach((itemInside) => {
        if (itemInside.paymentDesc === null || itemInside.paymentDesc === '' ||
          itemInside.total === null || itemInside.total === '') {
          isValid = false
        }
      })
    }

    if (params.companyAccountId && params.targetType && isValid) {
      return true
    } else {
      return false
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
      if (a[propName] !== b[propName]) {
        return false
      }
    }
    return true
  }

  setModalInsideVisible = (visible) => () => {
    this.setState({ editModalInsideIsOpen: visible })
  }
  handleSelectCategory = (category) => {
    const { currentEditBankTrans } = this.state
    if (!currentEditBankTrans || currentEditBankTrans.transTypeId ===
      category.transTypeId) {return}

    const newBankTrans = {
      ...currentEditBankTrans,
      iconType: category.iconType,
      transTypeId: category.transTypeId,
      transTypeName: category.transTypeName,
    }
    let valuesSave = Object.assign({}, this.state.obj)
    valuesSave.transes[this.state.idxObj].transTypeId = { ...newBankTrans }
    this.setState({
      obj: valuesSave,
      categoriesModalIsOpen: false,
      currentEditBankTrans: null,
    })
  }

  handleCloseCategoriesModal = () => {
    this.setState({
      categoriesModalIsOpen: false,
      currentEditBankTrans: null,
    })
  }

  handleOpenCategoriesModal = (bankTransId) => () => {
    this.setState({
      categoriesModalIsOpen: true,
      currentEditBankTrans: bankTransId,
    })
  }

  handleRemoveBankTransCategory = (transTypeId) => {
    const { currentCompanyId } = this.props
    return removeAccountCflTransTypeApi.post({
      body: {
        transTypeId,
        companyId: currentCompanyId,
      },
    })
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
    if (this.state.typeEditModal === 'companyAccountId') {
      this.setState({
        companyAccountIdNoValid: this.state.obj.companyAccountId === null ||
          this.state.obj.companyAccountId === '',
      })
    }
    if (this.state.typeEditModal === 'targetType') {
      if (this.state.obj.targetType === 'Checks') {
        this.animatedShowCheck()
      }

      this.setState({
        targetTypeValid: this.state.obj.targetType === null ||
          this.state.obj.targetType === '',
      })
    }
    this.setModalInsideVisible(!this.state.editModalInsideIsOpen)()
  }

  existingCheck = (text) => {
    let valuesSave = Object.assign({}, this.state.obj)
    const lastRow = valuesSave.transes[this.state.idxObj !== undefined
      ? this.state.idxObj
      : valuesSave.transes.length - 1]

    if (this.state.obj.companyAccountId &&
      ((text && text.length) || (valuesSave.biziboxMutavId) ||
        (Number(lastRow.total) !== 0 && lastRow.dueDate)) &&
      this.state.obj.targetType === 'Checks'
    ) {
      existingCheckApi.post({
        body: {
          chequeNo: (text && text.toString().length >= 4) ? Number(text) : null,
          companyAccountId: valuesSave.companyAccountId,
          'companyId': valuesSave.companyId,
          'total': lastRow.total ? Number(lastRow.total) : null,
          'biziboxMutavId': valuesSave.biziboxMutavId,
          'accountMutavName': (valuesSave.biziboxMutavId)
            ? (this.state.biziboxMutavList &&
            this.state.biziboxMutavList.length > 0 &&
            this.state.biziboxMutavList.find(
              (it) => it.biziboxMutavId === valuesSave.biziboxMutavId)
              ? (this.state.biziboxMutavList.find((it) => it.biziboxMutavId ===
                valuesSave.biziboxMutavId).accountMutavName)
              : null)
            : null,
          'expense': this.props.dataTypePayments === 44,
          'dueDate': lastRow.dueDate ? lastRow.dueDate : null,
        },
      }).then((result) => {
        if (result.length) {
          valuesSave.transes[this.state.idxObj].asmachtaExist = result[0]
        } else {
          valuesSave.transes[this.state.idxObj].asmachtaExist = null
        }
        this.setState({ obj: valuesSave })
      })
    }
  }
  setDataState = (data) => {
    this.setState({ obj: data }, () => {
      if (this.state.typeEditModal === 'companyAccountId') {
        this.existingCheck(this.state.obj.transes[this.state.idxObj].asmachta)
      }
    })
  }

  dueDate = () => {
    const { navigation } = this.props
    this.setModalInsideVisible(!this.state.editModalInsideIsOpen)()
    setTimeout(() => {
      goTo(navigation, 'RECOMMENDATION', {
        objParamas: {
          obj: { ...this.state.obj },
          idxObj: this.state.idxObj,
        },
      })
    }, 10)
  }

  closeModalCreatePayments = () => {
    const { closeModalCreatePayments } = this.props
    closeModalCreatePayments()
  }

  editInput = (param) => () => {
    if (param === 'accounts') {
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
    } else if (param === 'paymentList') {
      const paymentList = this.state.paymentList
      const selected = paymentList.find(
        (item) => item.id === this.state.obj.targetType)
      if (selected) {
        selected.selected = true
      }
      this.setState({
        typeEditModal: 'targetType',
        titleModalInside: 'סוג תשלום',
        dataList: paymentList,
      })
      this.setModalInsideVisible(true)()
    } else if (param === 'dueDate') {
      this.setState({
        typeEditModal: 'dueDate',
        titleModalInside: 'תאריך',
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
    } else if (param === 'total') {
      if (!this.state.disabledVal.total) {
        this.setState({ editSum: true })
      }
    } else if (param === 'transFrequencyName') {
      if (!this.state.disabledVal.transFrequencyName) {
        const transFrequencyName = this.state.transFrequencyName
        const selected = transFrequencyName.find(
          (item) => item.id === this.state.obj.transFrequencyName)
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
      const selected = autoUpdateTypeName.find(
        (item) => item.id === this.state.obj.autoUpdateTypeName)
      selected.selected = true
      this.setState({
        typeEditModal: 'autoUpdateTypeName',
        titleModalInside: 'סכום לתזרים',
        dataList: autoUpdateTypeName,
      })
      this.setModalInsideVisible(true)()
    } else if (param === 'endDate') {
      const endDate = this.state.endDate
      const selected = endDate.find(
        (item) => item.id === this.state.obj.endDate)
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
            this.setState({
              currentMutav: '',
              biziboxMutavList: data,
              biziboxMutavListFilter: data,
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
          if (this.state.obj.biziboxMutavId) {
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
                    if (it.biziboxMutavId === this.state.obj.biziboxMutavId) {
                      itemIndexTotal = itemIndex
                    }
                  })
                })
                // console.log('itemIndex', itemIndex)

                this.sectionListRef.scrollToLocation({
                  animated: true,
                  viewPosition: 0,
                  itemIndex: itemIndexTotal +
                    ((IS_IOS && itemIndexTotal > 0) ? -1 : 0),
                  sectionIndex: sectionIndex,
                })
              }
            }, 20)
          }

          this.setState({
            currentMutav: '',
            inProgressMutavList: false,
          })
        }
      }
    }
  }

  setStates = (params) => () => {
    this.setState(params)
  }

  dontShowAgain = () => {
    const { fadeAnim } = this.state
    Animated.timing(
      fadeAnim,
      {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      },
    ).start(() => {
      this.setState({ showAlert: false })
      const { dispatch } = this.props
      dispatch(setPopAddCashShow(false))
    })
  }
  animatedClose = () => {
    const { fadeAnim } = this.state
    Animated.timing(
      fadeAnim,
      {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      },
    ).start(() => {
      this.setState({ showAlert: false })
    })
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

  filterMutav = () => {
    let mutavListArr = JSON.parse(JSON.stringify(this.state.biziboxMutavList))
    if (this.state.currentMutav && this.state.currentMutav.length > 0) {
      mutavListArr = mutavListArr.filter(
        (item) => item.accountMutavName.includes(this.state.currentMutav))
    }
    mutavListArr = mutavListArr.reduce((memo, trans, currentIndex) => {
      const title = trans.accountMutavName.substring(0, 1)
      const oldIndex = memo.findIndex(item => item.title === title)
      if (oldIndex > -1) {
        memo[oldIndex].data.push(trans)
      } else {
        memo.push({
          title,
          data: [trans],
        })
      }
      return memo
    }, [])

    const isHebrew = mutavListArr.filter(
      (it) => /[\u0590-\u05FF]/.test(it.data[0].accountMutavName))
      .sort((a, b) => (a.data[0].accountMutavName > b.data[0].accountMutavName)
        ? 1
        : -1)
    const isEnglish = mutavListArr.filter(
      (it) => /^[A-Za-z]+$/.test(it.data[0].accountMutavName))
      .sort((a, b) => (a.data[0].accountMutavName > b.data[0].accountMutavName)
        ? 1
        : -1)
    const isNumbers = mutavListArr.filter(
      (it) => /^[0-9]+$/.test(it.data[0].accountMutavName))
      .sort((a, b) => (a.data[0].accountMutavName > b.data[0].accountMutavName)
        ? 1
        : -1)
    const isOthers = mutavListArr.filter(
      (it) => !/^[A-Za-z]+$/.test(it.data[0].accountMutavName) &&
        !/^[0-9]+$/.test(it.data[0].accountMutavName) &&
        !/[\u0590-\u05FF]/.test(it.data[0].accountMutavName))
      .sort((a, b) => (a.data[0].accountMutavName > b.data[0].accountMutavName)
        ? 1
        : -1)

    this.setState({
      biziboxMutavListFilter: isHebrew.concat(isEnglish, isNumbers, isOthers),
      inProgressMutavList: false,
    })
  }

  setMutav = (mutav) => () => {
    if (this.state.obj.biziboxMutavId && this.state.obj.biziboxMutavId ===
      mutav.biziboxMutavId) {
      let currentObjState = Object.assign({}, this.state.obj)
      currentObjState.biziboxMutavId = null
      currentObjState.transes[this.state.idxObj].transTypeId = {
        companyId: '00000000-0000-0000-0000-000000000000',
        createDefaultSupplier: true,
        iconType: 'No category',
        shonaScreen: true,
        transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
        transTypeName: 'ללא קטגוריה',
      }
      this.setState({
        obj: currentObjState,
        biziboxMutavValid: false,
      }, () => {
        this.existingCheck(this.state.obj.transes[this.state.idxObj].asmachta)
      })
    } else {
      let currentObjState = Object.assign({}, this.state.obj)
      currentObjState.biziboxMutavId = mutav.biziboxMutavId
      currentObjState.transes[this.state.idxObj].paymentDesc = (currentObjState.receiptTypeId !==
      44 ? 'העברה מ' : 'העברה ל') + '' + mutav.accountMutavName
      currentObjState.transes[this.state.idxObj].transTypeId = (this.props.categories.find(
        ctt => ctt.transTypeId === mutav.transTypeId))
        ? this.props.categories.find(
          ctt => ctt.transTypeId === mutav.transTypeId)
        : {
          companyId: '00000000-0000-0000-0000-000000000000',
          createDefaultSupplier: true,
          iconType: 'No category',
          shonaScreen: true,
          transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
          transTypeName: 'ללא קטגוריה',
        }
      this.setState({
        biziboxMutavValid: true,
        obj: currentObjState,
        paymentDescValid: currentObjState.transes[this.state.idxObj].paymentDesc ===
          '',
      }, () => {
        this.existingCheck(this.state.obj.transes[this.state.idxObj].asmachta)
      })
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
          <Text style={[
            styles.sectionTitleText, {
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
      // console.log('callback - show')
    })
  }

  onChange = (value, index, values) => {
    // console.log(values)
    this.setState({ selectedItems: values })
  }

  onItemPress = (value) => {
    if (value === 'edit') {
      // const mutavRow = this.state.mutavRow
      // console.log('Press: mutavRow -> ', mutavRow)
      this.addMutav()
    }
    // console.log('Press: value -> ', value)
  }

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
          backgroundColor: (item.biziboxMutavId ===
            this.state.obj.biziboxMutavId) ? '#f5f5f5' : '#ffffff',
        }}>
        <View style={{
          flex: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {item.biziboxMutavId === this.state.obj.biziboxMutavId && (
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

  removeMutavim = () => {
    let currentObjState = Object.assign({}, this.state.obj)
    currentObjState.biziboxMutavId = null
    currentObjState.transes[this.state.idxObj].transTypeId = {
      companyId: '00000000-0000-0000-0000-000000000000',
      createDefaultSupplier: true,
      iconType: 'No category',
      shonaScreen: true,
      transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
      transTypeName: 'ללא קטגוריה',
    }
    this.setState({
      obj: currentObjState,
      biziboxMutavValid: false,
    })
  }

  dontShowAgainCheck = () => {
    const { fadeAnimCheck } = this.state
    Animated.timing(
      fadeAnimCheck,
      {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      },
    ).start(() => {
      this.setState({ showAlertCheck: false })
      const { dispatch } = this.props
      dispatch(setPopAddCheckShow(false))
    })
  }

  animatedCloseCheck = () => {
    const { fadeAnimCheck } = this.state
    Animated.timing(
      fadeAnimCheck,
      {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      },
    ).start(() => {
      this.setState({ showAlertCheck: false })
    })
  }
  animatedShowCheck = () => {
    if (this.props.showPopAlertCheck) {
      const { fadeAnimCheck } = this.state
      Animated.timing(
        fadeAnimCheck,
        {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        },
      ).start(() => {
        this.setState({ showAlertCheck: true })
      })
    }
  }

  render () {
    const { categoriesModalIsOpen, currentEditBankTrans, obj, showAlert, fadeAnim, modalMutavListShow, currentMutav, biziboxMutavListFilter, inProgressMutavList, addMutavModal, mutavRow, showAlertCheck, fadeAnimCheck } = this.state
    const dataTypePayments = obj.receiptTypeId
    const { isRtl, currentCompanyId, accounts, selectedAccountIds } = this.props
    const total = getFormattedValueArray(
      this.state.obj.transes[this.state.idxObj].total)
    const numberStyle = cs(dataTypePayments === 44,
      [styles.dataValue, { color: colors.green4 }], { color: colors.red2 })
    const rowStyle = !isRtl ? 'row-reverse' : 'row'
    let isCheckExistText = ''
    if (this.state.obj.transes[this.state.idxObj].asmachtaExist) {
      const dueDate = AppTimezone.moment(
        this.state.obj.transes[this.state.idxObj].asmachtaExist.dueDate)
        .format('DD/MM/YY') === AppTimezone.moment().format('DD/MM/YY')
        ? 'היום'
        : AppTimezone.moment(
          this.state.obj.transes[this.state.idxObj].asmachtaExist.dueDate)
          .format('DD/MM/YY')
      const totals = String(getFormattedValueArray(
        this.state.obj.transes[this.state.idxObj].asmachtaExist.total)[0])
        .includes('-') ? (String(getFormattedValueArray(
        this.state.obj.transes[this.state.idxObj].asmachtaExist.total)[0])
        .replace('-', '') + '-') : getFormattedValueArray(
        this.state.obj.transes[this.state.idxObj].asmachtaExist.total)[0]

      if (this.state.obj.transes[this.state.idxObj].asmachtaExist.source) {
        // const accountMutavName = (obj.biziboxMutavId)
        //   ? (this.state.biziboxMutavList && this.state.biziboxMutavList.length > 0 && this.state.biziboxMutavList.find((it) => it.biziboxMutavId === obj.biziboxMutavId) ? (this.state.biziboxMutavList.find((it) => it.biziboxMutavId === obj.biziboxMutavId).accountMutavName) : null)
        //   : null

        const accountMutavName = this.state.obj.transes[this.state.idxObj].asmachtaExist.accountMutavName
        switch (this.state.obj.transes[this.state.idxObj].asmachtaExist.source) {
          case 'original':
            isCheckExistText =
              'מס׳ צ׳ק זה מופיע בתאריך ' +
              dueDate +
              ' בסכום של ' +
              totals +
              ' ש״ח'
            break

          case 'originalWithBank':
            isCheckExistText =
              'מס׳ צ׳ק זה מופיע בחשבון ' +
              (this.state.obj.transes[this.state.idxObj].asmachtaExist.accountNickname) +
              ' בתאריך ' +
              dueDate +
              ' בסכום של ' +
              totals +
              ' ש״ח'
            break
          case 'check':
            if (accountMutavName) {
              isCheckExistText =
                'צ\'ק ל' +
                accountMutavName +
                ' מופיע ב' +
                (this.state.obj.transes[this.state.idxObj].asmachtaExist.accountNickname) +
                ' בתאריך ' +
                dueDate +
                ' בסכום של ' +
                totals +
                ' ש״ח'
            } else {
              isCheckExistText =
                'צ\'ק ל' +
                this.state.obj.transes[this.state.idxObj].asmachtaExist.paymentDesc +
                ' מופיע ב' +
                (this.state.obj.transes[this.state.idxObj].asmachtaExist.accountNickname) +
                ' בתאריך ' +
                dueDate +
                ' בסכום של ' +
                totals +
                ' ש״ח'
            }
            break
          case 'wireTranfer':
            if (accountMutavName) {
              isCheckExistText =
                'העברה בנקאית ל' +
                accountMutavName +
                ' מופיע ב' +
                (this.state.obj.transes[this.state.idxObj].asmachtaExist.accountNickname) +
                ' בתאריך ' +
                dueDate +
                ' בסכום של ' +
                totals +
                ' ש״ח'
            } else {
              isCheckExistText =
                'העברה בנקאית ל' +
                this.state.obj.transes[this.state.idxObj].asmachtaExist.paymentDesc +
                ' מופיע ב' +
                (this.state.obj.transes[this.state.idxObj].asmachtaExist.accountNickname) +
                ' בתאריך ' +
                dueDate +
                ' בסכום של ' +
                totals +
                ' ש״ח'
            }
            break
          case 'other':
            if (accountMutavName) {
              isCheckExistText =
                'אחר ל' +
                accountMutavName +
                ' מופיע ב' +
                (this.state.obj.transes[this.state.idxObj].asmachtaExist.accountNickname) +
                ' בתאריך ' +
                dueDate +
                ' בסכום של ' +
                totals +
                ' ש״ח'
            } else {
              isCheckExistText =
                'אחר ל' +
                this.state.obj.transes[this.state.idxObj].asmachtaExist.paymentDesc +
                ' מופיע ב' +
                (this.state.obj.transes[this.state.idxObj].asmachtaExist.accountNickname) +
                ' בתאריך ' +
                dueDate +
                ' בסכום של ' +
                totals +
                ' ש״ח'
            }
            break
        }
      } else {
        isCheckExistText =
          'מס׳ צ׳ק זה מופיע בתאריך ' +
          dueDate +
          ' בסכום של ' +
          totals +
          ' ש״ח'
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
                  <View style={[
                    styles.container, {
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }]}>
                    <View/>
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
                          <Icon name="chevron-right" size={24}
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
                  paddingRight: 0,
                  flex: 1,
                }}>
                  <View style={[
                    {
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
                      style={[
                        {
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
                  }}/>

                  {inProgressMutavList && (
                    <Loader
                      isDefault
                      containerStyle={{ backgroundColor: 'transparent' }}
                      color={colors.blue}
                    />
                  )}

                  {(!inProgressMutavList && biziboxMutavListFilter.length ===
                    0 && currentMutav.length > 0) && (
                    <View>
                      <Image
                        style={[
                          {
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

                  {(!inProgressMutavList && biziboxMutavListFilter &&
                    biziboxMutavListFilter.length > 0) && (
                    <SectionList
                      ref={ref => (this.sectionListRef = ref)}
                      removeClippedSubviews
                      stickySectionHeadersEnabled
                      showsVerticalScrollIndicator={false}
                      scrollEnabled
                      style={[
                        styles.accountsContainer, {
                          flex: 1,
                          position: 'relative',
                        }]}
                      contentContainerStyle={[
                        styles.tableWrapper, {
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
                  {/*    style={[*/}
                  {/*      cs(isRtl, commonStyles.row, [commonStyles.rowReverse]),*/}
                  {/*      {*/}
                  {/*        flex: 1,*/}
                  {/*        flexDirection: 'row',*/}
                  {/*        justifyContent: 'flex-end',*/}
                  {/*        alignItems: 'center',*/}
                  {/*      }]}*/}
                  {/*    onPress={this.addMutav}>*/}
                  {/*    <View style={{*/}
                  {/*      paddingRight: 5,*/}
                  {/*    }}>*/}
                  {/*      <Text style={[*/}
                  {/*        {*/}
                  {/*          textAlign: 'right',*/}
                  {/*          color: '#2aa1d9',*/}
                  {/*          fontSize: sp(15),*/}
                  {/*        }, commonStyles.regularFont]}>*/}
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
                  color: '#022258',
                  textAlign: 'right',
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
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
                  color: '#022258',
                  textAlign: 'right',
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
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
                              color={'#022258'}/>
                }
                onPress={this.onItemPress}
              />
            </ActionSheet>

            {addMutavModal && (
              <AddMutav
                isEdit={mutavRow}
                paymentDesc={obj.targetType ? obj.targetType : 'BankTransfer'}
                companyId={currentCompanyId}
                companyAccountId={obj.companyAccountId
                  ? obj.companyAccountId
                  : accounts.find(a => a.companyAccountId ===
                    selectedAccountIds[0]).companyAccountId}
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
                  height: 68,
                  backgroundColor: '#002059',
                  width: '100%',
                  paddingTop: 0,
                  paddingLeft: 10,
                  paddingRight: 10,
                }}>
                  <View style={cs(
                    isRtl,
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
                        {this.state.titleModalInside}
                      </Text>
                    </View>
                    <View>
                      <TouchableOpacity
                        onPress={this.setModalInsideVisible(
                          !this.state.editModalInsideIsOpen)}>
                        <View style={{
                          marginRight: 'auto',
                        }}>
                          <Icon name="chevron-right" size={24}
                                color={colors.white}/>
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
                    {this.state.typeEditModal !== 'dueDate' && (<CheckList
                      close={this.handleCloseCheckListModal}
                      setDataState={this.setDataState}
                      data={this.state.dataList}
                      value={this.state.obj}
                      type={this.state.typeEditModal}
                    />)}
                    {this.state.typeEditModal === 'dueDate' && (<View style={{
                      height: Dimensions.get('window').height - 130,
                    }}>
                      <Calendar
                        minDate={this.today}
                        current={AppTimezone.moment(
                          this.state.obj.transes[this.state.idxObj].dueDate)
                          .format('YYYY-MM-DD')}
                        markedDates={{
                          [AppTimezone.moment(
                            this.state.obj.transes[this.state.idxObj].dueDate)
                            .format('YYYY-MM-DD')]: {
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
                          day.timestamp = AppTimezone.moment(day.dateString)
                            .valueOf()

                          let valuesSave = Object.assign({}, this.state.obj)
                          valuesSave.transes[this.state.idxObj].dueDate = day.timestamp
                          this.setState({
                            obj: valuesSave,
                          }, () => {
                            this.existingCheck(
                              this.state.obj.transes[this.state.idxObj].asmachta)
                            if (dataTypePayments === 400) {
                              this.setModalInsideVisible(
                                !this.state.editModalInsideIsOpen)()
                            }
                          })
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
                      /></View>)}
                  </KeyboardAwareScrollView>
                </View>
                {(this.state.typeEditModal === 'dueDate' && dataTypePayments ===
                  44) && (
                  <View style={[
                    cs(isRtl, {
                      position: 'absolute',
                      bottom: -100,
                      right: -100,
                    }, [
                      {
                        position: 'absolute',
                        bottom: -100,
                        left: -100,
                      }])]}>
                    <TouchableOpacity
                      onPress={this.dueDate}>
                      <View style={{
                        width: 240,
                        height: 240,
                        borderRadius: 120,
                        borderWidth: 2,
                        borderColor: '#bfe2dd',
                        flex: 1,
                      }}>
                        <CustomIcon name={'calc'} size={80} color={'#000'}
                                    style={[
                                      cs(isRtl, {
                                        position: 'absolute',
                                        bottom: 115,
                                        right: 115,
                                      }, [
                                        {
                                          position: 'absolute',
                                          bottom: 115,
                                          left: 115,
                                        }])]}/>
                      </View>
                    </TouchableOpacity>
                  </View>)}
              </View>
            </SafeAreaView>
          </Modal>

          {categoriesModalIsOpen && (
            <CategoriesModal
              isOpen
              isRtl={isRtl}
              companyId={this.state.obj.companyId}
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
                  [
                    styles.container, {
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }],
                  commonStyles.rowReverse,
                )}>
                  <View>
                    <TouchableOpacity onPress={this.closeModalCreatePayments}>
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
                      {'הוספת'} {dataTypePayments === 44
                      ? 'הוצאה'
                      : 'הכנסה'} {'צפוייה'}
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
                  }}/>

                  <View style={{
                    height: 185,
                    width: 290,
                    backgroundColor: '#ffffff',
                    borderRadius: 15,
                    zIndex: 10,
                    shadowColor: '#a0a0a0',
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
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
                    }}/>

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
                    }}/>

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
                            <CustomIcon name={'ok'} size={16}
                                        color={'#dddddd'}/>
                            <View style={{
                              paddingHorizontal: 2,
                            }}/>
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

              {showAlertCheck && (
                <Animated.View style={{
                  opacity: fadeAnimCheck,
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
                  }}/>

                  <View style={{
                    height: 185,
                    width: 290,
                    backgroundColor: '#ffffff',
                    borderRadius: 15,
                    zIndex: 10,
                    shadowColor: '#a0a0a0',
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
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
                      הקלדה מדויקת של מספר צ׳ק
                      {'\n'}
                      תאפשר
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(14),
                        lineHeight: 20,
                        fontFamily: fonts.bold,
                      }}>
                        {' התאמה אוטומטית '}
                      </Text>
                      כשהצ׳ק ייפרע
                    </Text>

                    <View style={{
                      width: '100%',
                      marginVertical: 5,
                      height: 1,
                      backgroundColor: '#dbdbdb',
                    }}/>
                    <Text style={{
                      color: '#0f3860',
                      fontSize: sp(14),
                      lineHeight: 20,
                      fontFamily: fonts.regular,
                      textAlign: 'right',
                    }}>
                      הקשת Enter לאחר הזנת סכום תוסיף
                      {'\n'}
                      צ׳ק מחזורי
                    </Text>

                    <View style={{
                      width: '100%',
                      marginVertical: 5,
                      height: 1,
                    }}/>

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
                          onPress={this.dontShowAgainCheck}>
                          <View style={{
                            flexDirection: 'row-reverse',
                            alignSelf: 'flex-end',
                            justifyContent: 'center',
                          }}>
                            <CustomIcon name={'ok'} size={16}
                                        color={'#dddddd'}/>
                            <View style={{
                              paddingHorizontal: 2,
                            }}/>
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
                        <TouchableOpacity onPress={this.animatedCloseCheck}>
                          <View style={{
                            height: 32.5,
                            width: 95,
                            backgroundColor: '#45b7ec',
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

              {this.state.obj.transes.length > 1 && (
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
                      style={[
                        {
                          height: 32,
                          flexDirection: 'row',
                          flex: 1,
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        },
                        cs(!isRtl, commonStyles.row,
                          [commonStyles.rowReverse])]}>
                      <View style={{
                        flex: 10,
                      }}/>
                      <View style={{
                        flex: 30,
                      }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          textAlign: 'right',
                          lineHeight: 32,
                          fontFamily: fonts.semiBold,
                        }}>
                          {'תאריך'}
                        </Text>
                      </View>
                      <View style={{
                        flex: 30,
                      }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          lineHeight: 32,
                          textAlign: 'right',
                          fontFamily: fonts.semiBold,
                        }}>
                          {'אסמכתא'}
                        </Text>
                      </View>
                      <View style={{
                        flex: 30,
                      }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          lineHeight: 32,
                          textAlign: 'right',
                          fontFamily: fonts.semiBold,
                        }}>
                          {'סכום בש״ח'}
                        </Text>
                      </View>
                      <View style={{
                        flex: 10,
                      }}/>
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
                      {this.state.obj.transes.map((c, i) => {
                        if (this.state.obj.transes.length > (i + 1)) {
                          return (
                            <View
                              key={i} style={[
                              {
                                paddingHorizontal: 15,
                                height: 36,
                                flexDirection: 'row',
                                flex: 1,
                                backgroundColor: (i === this.state.idxObj)
                                  ? '#e9ecf0'
                                  : '#f3f6fa',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderTopWidth: (i > 0) ? 1 : 0,
                                borderTopColor: '#e9ecf0',
                              },
                              cs(!isRtl, commonStyles.row,
                                [commonStyles.rowReverse])]}>
                              <View style={{
                                flex: 10,
                              }}>
                                <TouchableOpacity
                                  activeOpacity={1}
                                  onPress={this.editPayment(i)}>
                                  <Text
                                    style={{
                                      color: '#0f3860',
                                      fontSize: sp(13),
                                      textAlign: 'right',
                                      lineHeight: 36,
                                      fontFamily: fonts.regular,
                                    }}
                                    numberOfLines={1}
                                    ellipsizeMode="tail">
                                    {i + 1}</Text>
                                </TouchableOpacity>
                              </View>
                              <View style={{
                                flex: 30,
                              }}>
                                <TouchableOpacity
                                  activeOpacity={1}
                                  onPress={this.editPayment(i)}>
                                  <Text
                                    style={{
                                      color: '#0f3860',
                                      fontSize: sp(13),
                                      lineHeight: 36,
                                      textAlign: 'right',
                                      fontFamily: fonts.regular,
                                    }}
                                    numberOfLines={1}
                                    ellipsizeMode="tail">
                                    {AppTimezone.moment(c.dueDate)
                                      .format('DD/MM/YY')}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                              <View style={{
                                flex: 30,
                              }}>
                                <TouchableOpacity
                                  activeOpacity={1}
                                  onPress={this.editPayment(i)}>
                                  <Text
                                    style={{
                                      color: '#0f3860',
                                      fontSize: sp(13),
                                      textAlign: 'right',
                                      lineHeight: 36,
                                      fontFamily: fonts.regular,
                                    }}
                                    numberOfLines={1}
                                    ellipsizeMode="tail">
                                    {c.asmachta}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                              <View style={{
                                flex: 30,
                              }}>
                                <TouchableOpacity
                                  activeOpacity={1}
                                  onPress={this.editPayment(i)}>
                                  <Text
                                    style={{
                                      color: '#0f3860',
                                      fontSize: sp(13),
                                      textAlign: 'right',
                                      lineHeight: 36,
                                      fontFamily: fonts.regular,
                                    }}
                                    numberOfLines={1}
                                    ellipsizeMode="tail">
                                    {getFormattedValueArray(
                                      c.total)[0]}.{getFormattedValueArray(
                                    c.total)[1]}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                              <View style={{
                                flex: 10,
                              }}>
                                <TouchableOpacity
                                  onPress={this.removePayments(i)}>
                                  <CustomIcon name="trash" size={18}
                                              color={'#0f3860'}/>
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
                marginTop: (this.state.obj.transes.length > 1) ? 10 : 38,
                marginBottom: 0,
                paddingLeft: 0,
                paddingRight: 10,
                flex: 1,
              }}>
                <KeyboardAwareScrollView enableOnAndroid>
                  {this.state.idxObj > 0 && (
                    <View style={[
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 20,
                        marginBottom: 3,
                      }]}>
                      <View style={{
                        flex: 1.76,
                        alignItems: 'flex-end',
                      }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          lineHeight: 20,
                        }}>
                          {this.state.idxObj + 1}
                        </Text>
                      </View>
                    </View>
                  )}
                  <View style={[
                    cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: 8,
                    }]}>
                    <View style={{
                      flex: 1.76,
                      alignItems: 'flex-end',
                    }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        lineHeight: 42,
                      }}>חשבון</Text>
                    </View>
                    <View style={[
                      {
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
                        style={[
                          cs(isRtl, commonStyles.row,
                            [commonStyles.rowReverse]), {
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                          }]}
                        onPress={this.editInput('accounts')}>

                        <View style={{
                          marginRight: 'auto',
                        }}>
                          <Icon name="chevron-left" size={24}
                                color={colors.blue34}/>
                        </View>
                        <Text
                          style={[
                            styles.dataRowLevel3Text, {
                              fontSize: sp(15),
                              color: '#0f3860',
                              lineHeight: 42,
                            }, commonStyles.regularFont]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {(this.state.obj.companyAccountId)
                            ? this.props.accounts.find(
                              a => a.companyAccountId ===
                                this.state.obj.companyAccountId).accountNickname
                            : 'בחר חשבון'}
                        </Text>
                        <View style={commonStyles.spaceDivider}/>
                        <AccountIcon
                          account={this.props.accounts.find(
                            a => a.companyAccountId ===
                              this.state.obj.companyAccountId)}/>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={[
                    cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: 8,
                    }]}>
                    <View style={{
                      flex: 1.76,
                      alignItems: 'flex-end',
                    }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        lineHeight: 42,
                      }}>מוטב</Text>
                    </View>

                    <View style={[
                      {
                        flex: 5.73,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }]}>
                      <View
                        style={[
                          cs(isRtl, commonStyles.row,
                            [commonStyles.rowReverse]), {
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
                              hitSlop={{
                                top: 20,
                                bottom: 20,
                                left: 20,
                                right: 20,
                              }}
                              onPress={this.editInput('biziboxMutavList')}>
                              <Icon name="chevron-left" size={24}
                                    color={colors.blue34}/>
                            </TouchableOpacity>
                          </View>

                          {(this.state.obj.biziboxMutavId) && (
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
                                  style={[
                                    {
                                      resizeMode: 'contain',
                                      height: 20,
                                      width: 20,
                                    }]}
                                  source={require(
                                    'BiziboxUI/assets/close-cancel.png')}
                                />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                        <Text style={[
                          {
                            textAlign: 'right',
                            color: (!this.state.obj.biziboxMutavId)
                              ? '#d0cece'
                              : '#0f3860',
                            fontSize: sp(15),
                            lineHeight: 42,
                          }, commonStyles.regularFont]}>
                          {(this.state.obj.biziboxMutavId)
                            ? (this.state.biziboxMutavList &&
                            this.state.biziboxMutavList.length > 0 &&
                            this.state.biziboxMutavList.find(
                              (it) => it.biziboxMutavId ===
                                this.state.obj.biziboxMutavId)
                              ? (this.state.biziboxMutavList.find(
                                (it) => it.biziboxMutavId ===
                                  this.state.obj.biziboxMutavId).accountMutavName)
                              : '')
                            : 'לא חובה'
                          }
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={[
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                    <View style={{
                      flex: 1.76,
                      alignItems: 'flex-end',
                    }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        lineHeight: 42,
                      }}>תיאור</Text>
                    </View>
                    <View style={[
                      {
                        flex: 5.73,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                        alignItems: 'flex-end',
                      }, cs(this.state.paymentDescValid, {}, {
                        borderWidth: 1,
                        borderColor: colors.red,
                      })]}>
                      <TextInput
                        autoCorrect={false}
                        keyboardType="default"
                        style={[
                          {
                            textAlign: 'right',
                            color: '#0f3860',
                            height: 42,
                            fontSize: sp(15),
                            width: '100%',
                          }, commonStyles.regularFont]}
                        onEndEditing={(e) => {
                          let valuesSave = Object.assign({}, this.state.obj)
                          valuesSave.transes[this.state.idxObj].paymentDesc = e.nativeEvent.text
                          this.setState({
                            obj: valuesSave,
                            paymentDescValid: valuesSave.transes[this.state.idxObj].paymentDesc ===
                              '',
                          })
                        }}
                        onChangeText={(paymentDesc) => {
                          let valuesSave = Object.assign({}, this.state.obj)
                          valuesSave.transes[this.state.idxObj].paymentDesc = paymentDesc
                          this.setState({
                            obj: valuesSave,
                            paymentDescValid: valuesSave.transes[this.state.idxObj].paymentDesc ===
                              '',
                          })
                        }}
                        value={this.state.obj.transes[this.state.idxObj].paymentDesc}
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
                    <View style={{
                      flex: 1.76,
                      alignItems: 'flex-end',
                    }}>
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
                        style={[
                          cs(isRtl, commonStyles.row,
                            [commonStyles.rowReverse]), {
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                          }]}
                        onPress={this.handleOpenCategoriesModal(
                          this.state.obj.transes[this.state.idxObj].transTypeId)}
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
                          {this.state.obj.transes[this.state.idxObj].transTypeId.transTypeName}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View
                    style={[
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                    <View style={{
                      flex: 1.76,
                      alignItems: 'flex-end',
                    }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        lineHeight: 42,
                      }}>סוג תשלום</Text>
                    </View>
                    <View style={[
                      {
                        flex: 5.73,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }, cs(this.state.targetTypeValid, {}, {
                        borderWidth: 1,
                        borderColor: colors.red,
                      })]}>
                      <TouchableOpacity
                        style={[
                          cs(isRtl, commonStyles.row,
                            [commonStyles.rowReverse]), {
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                          }]}
                        onPress={this.editInput('paymentList')}>
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

                          {(this.state.obj.targetType)
                            ? (this.props.searchkey &&
                            this.props.searchkey.length > 0 &&
                            this.props.searchkey.find(
                              (it) => it.paymentDescription ===
                                this.state.obj.targetType)
                              ? this.props.searchkey.find(
                                (it) => it.paymentDescription ===
                                  this.state.obj.targetType).name
                              : '')
                            : 'בחר'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View
                    style={[
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                    <View style={{
                      flex: 1.76,
                      alignItems: 'flex-end',
                    }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
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
                        style={[
                          cs(isRtl, commonStyles.row,
                            [commonStyles.rowReverse]), {
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                          }]}
                        onPress={this.editInput('dueDate')}>
                        <View style={{
                          marginRight: 'auto',
                        }}>
                          <CustomIcon name={'calendar'} size={24}
                                      color={colors.blue34}/>
                        </View>
                        <Text style={[
                          {
                            textAlign: 'right',
                            color: '#0f3860',
                            fontSize: sp(15),
                            lineHeight: 42,
                          }, commonStyles.regularFont]}>{AppTimezone.moment(
                          this.state.obj.transes[this.state.idxObj].dueDate)
                          .format('DD/MM/YY')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View
                    style={[
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                    <View style={{
                      flex: 1.76,
                      alignItems: 'flex-end',
                    }}>
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
                        autoCorrect={false}
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
                        onEndEditing={(e) => {
                          let valuesSave = Object.assign({}, this.state.obj)
                          valuesSave.transes[this.state.idxObj].asmachta = e.nativeEvent.text.toString()
                            .replace(/[^\d]/g, '')
                          this.setState({ obj: valuesSave })
                          this.existingCheck(
                            e.nativeEvent.text.toString().replace(/[^\d]/g, ''))
                        }}
                        onChangeText={(asmachta) => {
                          let valuesSave = Object.assign({}, this.state.obj)
                          valuesSave.transes[this.state.idxObj].asmachta = asmachta.toString()
                            .replace(/[^\d]/g, '')
                          this.setState({ obj: valuesSave })
                          this.existingCheck(
                            asmachta.toString().replace(/[^\d]/g, ''))
                        }}
                        value={inputWorkaround.getWorkaroundChar() + String(
                          this.state.obj.transes[this.state.idxObj].asmachta)}
                        underlineColorAndroid="transparent"
                      />
                    </View>
                  </View>
                  {this.state.obj.transes[this.state.idxObj].asmachtaExist &&
                  (<View
                    style={[
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        marginBottom: 8,
                      }]}>
                    <View style={{
                      flex: 1.76,
                      alignItems: 'flex-end',
                    }}/>
                    <View style={{
                      flex: 5.73,
                    }}>
                      <Text style={{
                        color: colors.red2,
                        fontSize: sp(13),
                        lineHeight: 20,
                        textAlign: 'right',
                      }}>{isCheckExistText}</Text>
                    </View>
                  </View>)}
                  <View
                    style={[
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                    <View style={{
                      flex: 1.76,
                      alignItems: 'flex-end',
                    }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        lineHeight: 42,
                      }}>סכום בש״ח</Text>
                    </View>
                    <View style={[
                      {
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
                          editable={this.state.editSum}
                          keyboardType={(IS_IOS) ? 'decimal-pad' : 'numeric'}
                          style={[
                            {
                              direction: 'ltr',
                              textAlign: 'right',
                              color: '#0f3860',
                              height: 42,
                              fontSize: sp(15),
                              width: '100%',
                            }, commonStyles.regularFont]}
                          onEndEditing={(e) => {
                            let valuesSave = Object.assign({}, this.state.obj)
                            valuesSave.transes[this.state.idxObj].total = e.nativeEvent.text
                            this.setState({
                              obj: valuesSave,
                              editSum: false,
                              totalNoValid: valuesSave.transes[this.state.idxObj].total ===
                                '',
                            }, () => {
                              this.existingCheck(
                                this.state.obj.transes[this.state.idxObj].asmachta)
                            })
                          }}
                          onChangeText={(total) => {
                            let valuesSave = Object.assign({}, this.state.obj)
                            valuesSave.transes[this.state.idxObj].total = total
                            this.setState({
                              obj: valuesSave,
                              totalNoValid: valuesSave.transes[this.state.idxObj].total ===
                                '',
                            })
                          }}
                          value={this.state.obj.transes[this.state.idxObj].total !==
                          null
                            ? String(
                              this.state.obj.transes[this.state.idxObj].total)
                            : ''}
                          underlineColorAndroid="transparent"
                        />
                      )}

                      {!this.state.editSum && (
                        <TouchableOpacity
                          style={[
                            cs(isRtl, commonStyles.row,
                              [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                            }]}
                          onPress={this.setStates({ editSum: true })}>
                          {(this.state.obj.transes[this.state.idxObj].total !==
                            null &&
                            this.state.obj.transes[this.state.idxObj].total !==
                            '') && (
                            <Text
                              style={[
                                styles.dataValueWrapper,
                                styles.dataValueWrapperLevel2,
                                {
                                  fontSize: sp(15),
                                  lineHeight: 42,
                                  color: '#0f3860',
                                },
                                commonStyles.regularFont]} numberOfLines={1}
                              ellipsizeMode="tail">
                              <Text style={[
                                numberStyle, {
                                  fontSize: sp(15),
                                  lineHeight: 42,
                                  color: '#0f3860',
                                }, commonStyles.regularFont]}>{total[0]}</Text>
                              <Text style={[
                                styles.fractionalPart, {
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
                  <View
                    style={[
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 32,
                        marginBottom: 8,
                      }]}>
                    <View style={{
                      flex: 1.50,
                      alignItems: 'flex-end',
                    }}/>
                    <View style={{
                      flex: 5.73,
                    }}>
                      {this.isValidList() && (<TouchableOpacity
                        style={[
                          cs(isRtl, commonStyles.row,
                            [commonStyles.rowReverse]), {
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                          }]}
                        onPress={this.addPayments}>
                        <View style={{
                          paddingRight: 5,
                        }}>
                          <Text style={[
                            {
                              textAlign: 'right',
                              color: '#2aa1d9',
                              fontSize: sp(15),
                            }, commonStyles.regularFont]}>
                            {'הוספת תשלומים'}
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
                      </TouchableOpacity>)}
                      {!this.isValidList() && (<TouchableOpacity
                        style={[
                          cs(isRtl, commonStyles.row,
                            [commonStyles.rowReverse]), {
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            opacity: 0.3,
                          }]}
                        onPress={this.addPayments}>
                        <View style={{
                          paddingRight: 5,
                        }}>
                          <Text style={[
                            {
                              textAlign: 'right',
                              color: '#2aa1d9',
                              fontSize: sp(15),
                            }, commonStyles.regularFont]}>
                            {'הוספת תשלומים'}
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
                      </TouchableOpacity>)}
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
