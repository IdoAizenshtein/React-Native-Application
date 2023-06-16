import React, { PureComponent } from 'react'
import {
  Animated,
  Dimensions,
  Image,
  Modal,
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
import styles from '../ChecksStyles'
import CustomIcon from '../../../components/Icons/Fontello'
import {
  combineStyles as cs,
  getFormattedValueArray,
  sp,
} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import AccountIcon from '../../../components/AccountIcon/AccountIcon'
import AppTimezone from '../../../utils/appTimezone'
import CheckList from './CheckList'
import { Calendar } from 'react-native-calendars'
import { Icon } from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { IS_IOS } from '../../../constants/common'
import {
  createAccountCflTransTypeApi,
  existingCheckApi,
  getMutavApi,
  removeAccountCflTransTypeApi,
} from '../../../api'
import CategoriesModal from 'src/components/CategoriesModal/CategoriesModal'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import Loader from '../../../components/Loader/Loader'
import {
  ActionSheet,
  ActionSheetItem,
} from 'react-native-action-sheet-component'
import AddMutav from '../../../components/AddMutav/AddMutav'

@withTranslation()
export default class EditRowModal extends PureComponent {
  today = AppTimezone.moment().valueOf()

  constructor (props) {
    super(props)
    const item = props.item

    this.state = {
      saveOriginObj: JSON.parse(JSON.stringify(item)),
      obj: {
        targetType: item.targetType,
        companyId: props.companyId,
        chequeComment: item.chequeComment,
        chequeNo: (item.chequeNo !== undefined && item.chequeNo !== null)
          ? String(item.chequeNo)
          : '',
        chequePaymentId: item.chequePaymentId,
        companyAccountId: item.companyAccountId,
        total: item.total,
        transTypeId: item.transType,
        userDescription: item.mainDescription,
        dueDate: item.dueDate,
        asmachtaExist: null,
        biziboxMutavId: item.biziboxMutavId ? item.biziboxMutavId : null,
      },
      disabledEdit: {
        chequeComment: true,
        chequeNo: !item.isEditable.chequeNo,
        chequePaymentId: true,
        companyAccountId: !item.isEditable.account,
        total: !item.isEditable.total,
        transTypeId: !item.isEditable.transType,
        userDescription: !item.isEditable.mainDescription,
        dueDate: !item.isEditable.dueDateAsDate,
      },
      categoriesModalIsOpen: false,
      currentEditBankTrans: null,
      expirationDate: null,
      editRowModalIsOpen: false,
      editModalInsideIsOpen: false,
      timesValue: 0,
      tab: 1,
      editSum: false,
      titleModalInside: '',
      transDate: null,
      dataOfRowGroup: {},
      dataList: [],
      typeEditModal: null,
      biziboxMutavValid: true,
      biziboxMutavList: [],
      biziboxMutavListFilter: [],
      modalMutavListShow: false,
      currentMutav: '',
      inProgressMutavList: false,
      addMutavModal: false,
      mutavRow: null,
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
      this.setState({
        obj: currentObjState,
        biziboxMutavValid: false,
      }, () => {
        this.existingCheck(this.state.obj.chequeNo)
      })
    } else {
      let currentObjState = Object.assign({}, this.state.obj)
      currentObjState.biziboxMutavId = mutav.biziboxMutavId
      this.setState({
        biziboxMutavValid: true,
        obj: currentObjState,
      }, () => {
        this.existingCheck(this.state.obj.chequeNo)
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
    getMutavApi.post({ body: { uuid: this.props.companyId } })
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
    this.setState({
      obj: currentObjState,
      biziboxMutavValid: false,
    })
  }

  update = () => {
    const { updateRow } = this.props
    const params = this.state.obj
    let valuesSave = Object.assign({}, params)
    this.setState({
      biziboxMutavValid: valuesSave.biziboxMutavId !== null,
      userDescriptionNoValid: valuesSave.userDescription === '',
      totalNoValid: valuesSave.total === '',
    })
    if (valuesSave.userDescription === '' || valuesSave.total === '') {return}
    // console.log(valuesSave)

    this.setModalVisible(false)()
    setTimeout(() => {
      updateRow(valuesSave)
    }, 10)
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

  setModalVisible = (visible) => () => {
    this.setState({ editRowModalIsOpen: visible })
  }
  setModalInsideVisible = (visible) => () => {
    this.setState({ editModalInsideIsOpen: visible })
  }

  getAccountCflTransType (transTypeId) {
    const { getAccountCflTransType } = this.props
    if (getAccountCflTransType && transTypeId) {
      const type = getAccountCflTransType.find(
        (item) => (item.transTypeId === transTypeId))
      if (type !== undefined) {
        return type
      } else {
        return getAccountCflTransType[0]
      }
    } else {
      return ''
    }
  }

  handleCloseCheckListModal = () => {
    this.setModalInsideVisible(!this.state.editModalInsideIsOpen)()
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
    valuesSave.transTypeId = { ...newBankTrans }
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

  handleOpenCategoriesModal = (bankTransId) => {
    this.setState({
      categoriesModalIsOpen: true,
      currentEditBankTrans: bankTransId,
    })
  }

  handleRemoveBankTransCategory = (transTypeId) => {
    const { companyId } = this.props
    return removeAccountCflTransTypeApi.post({
      body: {
        transTypeId,
        companyId: companyId,
      },
    })
  }

  handleCreateBankTransCategory = (transTypeName) => {
    const { companyId } = this.props
    return createAccountCflTransTypeApi.post({
      body: {
        companyId: companyId,
        'transTypeId': null,
        transTypeName,
      },
    })
  }

  existingCheck = (text) => {
    const { screenSwitchState } = this.props
    let valuesSave = Object.assign({}, this.state.obj)

    if (this.state.obj.companyAccountId &&
      ((text && text.length) || (valuesSave.biziboxMutavId) ||
        (Number(valuesSave.total) !== 0 && valuesSave.dueDate))
      // && ddTypePayments === 'Checks'
    ) {
      existingCheckApi.post({
        body: {
          chequeNo: (text && text.toString().length >= 4) ? Number(text) : null,
          companyAccountId: valuesSave.companyAccountId,
          'companyId': valuesSave.companyId,
          'total': valuesSave.total ? Number(valuesSave.total) : null,
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
          'expense': !screenSwitchState,
          'dueDate': valuesSave.dueDate ? valuesSave.dueDate : null,
        },
      }).then((result) => {
        if (result.length) {
          valuesSave.asmachtaExist = result[0]
        } else {
          valuesSave.asmachtaExist = null
        }
        this.setState({ obj: valuesSave })
      })
    }
  }

  setDataState = (data) => {
    this.setState({
      obj: data,
    }, () => {
      if (this.state.typeEditModal === 'companyAccountId') {
        this.existingCheck(this.state.obj.chequeNo)
      }
    })
  }

  editPress = () => {
    this.setState({
      editSum: false,
    })
    if (!this.state.biziboxMutavList.length) {
      getMutavApi.post({ body: { uuid: this.props.companyId } })
        .then(data => {
          this.setState({
            currentMutav: '',
            biziboxMutavList: data,
            biziboxMutavListFilter: data,
          })
          this.filterMutav()
        })
    }
    this.setModalVisible(true)()
  }

  editInput = (param) => () => {
    if (param === 'companyAccountId') {
      if (!this.state.disabledEdit.companyAccountId) {
        const types = this.props.accounts.map((item) => {
          return {
            text: item.accountNickname,
            id: item.companyAccountId,
            selected: (item.companyAccountId ===
              this.state.obj.companyAccountId),
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
    } else if (param === 'transTypeId') {
      if (!this.state.disabledEdit.transTypeId) {
        this.handleOpenCategoriesModal(this.state.obj.transTypeId)
      }
    } else if (param === 'dueDate') {
      const isEditableDueDate = !this.state.disabledEdit.dueDate &&
        this.state.obj.targetType !== 'BANK_CHEQUE' &&
        AppTimezone.moment(this.state.obj.dueDate)
          .isSameOrAfter(AppTimezone.moment().valueOf())
      if (isEditableDueDate) {
        this.setState({
          typeEditModal: 'dueDate',
          titleModalInside: 'ת.פירעון',
        })
        this.setModalInsideVisible(true)()
      }
    } else if (param === 'total') {
      if (!this.state.disabledEdit.total) {
        this.setState({ editSum: true })
      }
    } else if (param === 'biziboxMutavList') {
      this.setState({
        inProgressMutavList: true,
      })
      this.openModalMutavList()
      if (!this.state.biziboxMutavList.length) {
        getMutavApi.post({ body: { uuid: this.props.companyId } })
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

  render () {
    const { item, isRtl, screenSwitchState, selectedAccountIds, accounts, companyId } = this.props
    const { categoriesModalIsOpen, currentEditBankTrans, obj, modalMutavListShow, currentMutav, biziboxMutavListFilter, inProgressMutavList, addMutavModal, mutavRow } = this.state
    const total = getFormattedValueArray(item.total)
    const numberStyle = cs(!screenSwitchState,
      [styles.dataValue, { color: colors.green4 }], { color: colors.red2 })
    const rowStyle = !isRtl ? 'row-reverse' : 'row'
    const isEditableDueDate = !this.state.disabledEdit.dueDate &&
      obj.targetType !== 'BANK_CHEQUE' && AppTimezone.moment(obj.dueDate)
        .isSameOrAfter(AppTimezone.moment().valueOf())

    let isCheckExistText = ''
    if (this.state.obj.asmachtaExist) {
      const dueDate = AppTimezone.moment(this.state.obj.asmachtaExist.dueDate)
        .format('DD/MM/YY') === AppTimezone.moment().format('DD/MM/YY')
        ? 'היום'
        : AppTimezone.moment(this.state.obj.asmachtaExist.dueDate)
          .format('DD/MM/YY')
      const totals = String(
        getFormattedValueArray(this.state.obj.asmachtaExist.total)[0])
        .includes('-') ? (String(
        getFormattedValueArray(this.state.obj.asmachtaExist.total)[0])
        .replace('-', '') + '-') : getFormattedValueArray(
        this.state.obj.asmachtaExist.total)[0]

      if (this.state.obj.asmachtaExist.source) {
        // const accountMutavName = (obj.biziboxMutavId)
        //   ? (this.state.biziboxMutavList && this.state.biziboxMutavList.length > 0 && this.state.biziboxMutavList.find((it) => it.biziboxMutavId === obj.biziboxMutavId) ? (this.state.biziboxMutavList.find((it) => it.biziboxMutavId === obj.biziboxMutavId).accountMutavName) : null)
        //   : null

        const accountMutavName = this.state.obj.asmachtaExist.accountMutavName

        switch (this.state.obj.asmachtaExist.source) {
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
              (this.state.obj.asmachtaExist.accountNickname) +
              ' בתאריך ' +
              dueDate +
              ' בסכום של ' +
              totals +
              ' ש״ח'
            break
          case 'check':
            if (accountMutavName) {
              isCheckExistText =
                ' צ\'ק ל' +
                accountMutavName +
                ' מופיע ב' +
                (this.state.obj.asmachtaExist.accountNickname) +
                ' בתאריך ' +
                dueDate +
                ' בסכום של ' +
                totals +
                ' ש״ח'
            } else {
              isCheckExistText =
                'צ\'ק ל' +
                this.state.obj.asmachtaExist.paymentDesc +
                ' מופיע ב' +
                (this.state.obj.asmachtaExist.accountNickname) +
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
                (this.state.obj.asmachtaExist.accountNickname) +
                ' בתאריך ' +
                dueDate +
                ' בסכום של ' +
                totals +
                ' ש״ח'
            } else {
              isCheckExistText =
                'העברה בנקאית ל' +
                this.state.obj.asmachtaExist.paymentDesc +
                ' מופיע ב' +
                (this.state.obj.asmachtaExist.accountNickname) +
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
                (this.state.obj.asmachtaExist.accountNickname) +
                ' בתאריך ' +
                dueDate +
                ' בסכום של ' +
                totals +
                ' ש״ח'
            } else {
              isCheckExistText =
                'אחר ל' +
                this.state.obj.asmachtaExist.paymentDesc +
                ' מופיע ב' +
                (this.state.obj.asmachtaExist.accountNickname) +
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
          visible={this.state.editRowModalIsOpen}
          onRequestClose={() => {
            // console.log('Modal has been closed.')
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
                              color={'#022258'}/>
                }
                onPress={this.onItemPress}
              />
            </ActionSheet>

            {addMutavModal && (
              <AddMutav
                isEdit={mutavRow}
                paymentDesc={obj.targetType ? obj.targetType : 'BankTransfer'}
                companyId={companyId}
                companyAccountId={obj.companyAccountId
                  ? obj.companyAccountId
                  : accounts.find(a => a.companyAccountId ===
                    selectedAccountIds[0]) ? accounts.find(a => a.companyAccountId ===
                    selectedAccountIds[0]).companyAccountId : null}
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
              // console.log('Modal has been closed.')
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
                        current={AppTimezone.moment(this.state.obj.dueDate)
                          .format('YYYY-MM-DD')}
                        markedDates={{
                          [AppTimezone.moment(this.state.obj.dueDate)
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
                          valuesSave.dueDate = day.timestamp
                          this.setState({
                            obj: valuesSave,
                          }, () => {
                            this.existingCheck(this.state.obj.chequeNo)
                            this.setModalInsideVisible(
                              !this.state.editModalInsideIsOpen)()
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
                    <TouchableOpacity onPress={this.setModalVisible(false)}>
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
                      {'עריכת צ׳ק'} {(screenSwitchState) ? 'נכנס' : 'יוצא'}
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

                <KeyboardAwareScrollView enableOnAndroid>
                  <View style={[
                    cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                    {
                      height: 42,
                      marginBottom: 8,
                    },
                    cs(this.state.disabledEdit.companyAccountId, { opacity: 1 },
                      { opacity: 0.3 })]}>
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
                        onPress={this.editInput('companyAccountId')}>

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
                                this.state.obj.companyAccountId) ? this.props.accounts.find(
                                      a => a.companyAccountId ===
                                          this.state.obj.companyAccountId).accountNickname : 'בחר חשבון' : 'בחר חשבון'}
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
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                      {
                        height: 42,
                        marginBottom: 8,
                      },
                      cs(this.state.disabledEdit.userDescription,
                        { opacity: 1 }, { opacity: 0.3 })]}>
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
                      }, cs(this.state.userDescriptionNoValid, {}, {
                        borderWidth: 1,
                        borderColor: colors.red,
                      })]}>
                      <TextInput
                        editable={!this.state.disabledEdit.userDescription}
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
                          valuesSave.userDescription = e.nativeEvent.text
                          this.setState({
                            obj: valuesSave,
                            userDescriptionNoValid: valuesSave.userDescription ===
                              '',
                          })
                          // console.log(valuesSave.userDescription === '')
                          // console.log(this.state.userDescriptionNoValid)
                        }}
                        onChangeText={(userDescription) => {
                          let valuesSave = Object.assign({}, this.state.obj)
                          valuesSave.userDescription = userDescription
                          this.setState({
                            obj: valuesSave,
                            userDescriptionNoValid: valuesSave.userDescription ===
                              '',
                          })
                          // console.log(valuesSave.userDescription === '')
                          // console.log(this.state.userDescriptionNoValid)
                        }}
                        value={this.state.obj.userDescription}
                        underlineColorAndroid="transparent"
                      />
                    </View>
                  </View>

                  <View
                    style={[
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                      {
                        height: 42,
                        marginBottom: 8,
                      },
                      cs(this.state.disabledEdit.transTypeId, { opacity: 1 },
                        { opacity: 0.3 })]}>
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
                        onPress={this.editInput('transTypeId')}>
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
                          {this.state.obj.transTypeId.transTypeName}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View
                    style={[
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                      {
                        height: 42,
                        marginBottom: 8,
                      },
                      cs(this.state.disabledEdit.chequeNo, { opacity: 1 },
                        { opacity: 0.3 })]}>
                    <View style={{
                      flex: 1.76,
                      alignItems: 'flex-end',
                    }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        lineHeight: 42,
                      }}>מספר הצ׳ק</Text>
                    </View>
                    <View style={{
                      flex: 5.73,
                      backgroundColor: '#f5f5f5',
                      paddingHorizontal: 21,
                      borderBottomRightRadius: 20,
                      borderTopRightRadius: 20,
                    }}>
                      <TextInput
                        editable={!this.state.disabledEdit.chequeNo}
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
                        onEndEditing={(e) => this.existingCheck(
                          e.nativeEvent.text)}
                        onChangeText={(chequeNo) => {
                          let valuesSave = Object.assign({}, this.state.obj)
                          valuesSave.chequeNo = chequeNo
                          this.setState({ obj: valuesSave })
                        }}
                        value={this.state.obj.chequeNo}
                        underlineColorAndroid="transparent"
                      />
                    </View>
                  </View>

                  {this.state.obj.asmachtaExist && (<View
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
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                      {
                        height: 42,
                        marginBottom: 8,
                      },
                      cs((isEditableDueDate), { opacity: 0.3 },
                        { opacity: 1 })]}>
                    <View style={{
                      flex: 1.76,
                      alignItems: 'flex-end',
                    }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        lineHeight: 42,
                      }}>ת.פירעון</Text>
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
                          this.state.obj.dueDate).format('DD/MM/YY')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View
                    style={[
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                      {
                        height: 42,
                        marginBottom: 8,
                      },
                      cs(this.state.disabledEdit.total, { opacity: 1 },
                        { opacity: 0.3 })]}>
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
                          editable={!this.state.disabledEdit.total &&
                          this.state.editSum}
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
                            valuesSave.total = e.nativeEvent.text
                            this.setState({
                              obj: valuesSave,
                              editSum: false,
                              totalNoValid: valuesSave.total === '',
                            }, () => {
                              this.existingCheck(this.state.obj.chequeNo)
                            })
                          }}
                          onChangeText={(total) => {
                            let valuesSave = Object.assign({}, this.state.obj)
                            valuesSave.total = total
                            this.setState({
                              obj: valuesSave,
                              totalNoValid: valuesSave.total === '',
                            })
                          }}
                          value={this.state.obj.total !== null ? String(
                            this.state.obj.total) : ''}
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
                          onPress={this.editInput('total')}>
                          {(this.state.obj.total !== null &&
                            this.state.obj.total !== '') && (
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
                </KeyboardAwareScrollView>
              </View>
            </View>
          </SafeAreaView>
        </Modal>

        <TouchableOpacity
          onPress={this.editPress}>
          <View style={styles.categoryEditBtnWrapper}>
            <CustomIcon
              name="pencil"
              size={18}
              color={colors.blue36}
            />
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}
