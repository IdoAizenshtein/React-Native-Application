import React, { PureComponent } from 'react'
import {
  Modal,
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
import { connect } from 'react-redux'

@connect(state => ({
  searchkey: state.searchkey,
}))
@withTranslation()
export default class EditRowModal extends PureComponent {
  today = AppTimezone.moment().valueOf()

  constructor (props) {
    super(props)

    this.state = {
      dataOfRow: props.dataOfRow,
      saveOriginObj: {},
      expirationDate: null,
      editRowModalIsOpen: false,
      editModalInsideIsOpen: false,
      timesValue: 0,
      tab: 1,
      editSum: false,
      titleModalInside: '',
      transDate: null,
      originalDate: null,
      disabledGrTab1: {
        account: true,
        transName: true,
        transTypeName: true,
        paymentDesc: true,
        asmachta: true,
        transDate: true,
        total: true,
      },
      disabledGrTab2: {
        account: true,
        transName: true,
        transTypeName: true,
        paymentDesc: true,
        transDate: true,
        total: true,
        transFrequencyName: true,
      },
      dataOfRowGroup: {},
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
          text: 'לאחר מספר פעמים',
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
    }
  }

  isStatusReload (status) {
    if (status === 'CHEQUE' || status === 'OTHER' || status ===
      'WIRE_TRANSFER' || status === 'CYCLIC_TRANS') {
      return true
    }
    return false
  }

  update = () => {
    if (this.state.tab === 1) {
      const { dataOfRow } = this.state
      const { updateRow } = this.props
      if (!this.isEquivalent(dataOfRow, this.state.saveOriginObj)) {
        let reloadData = false
        if (this.state.saveOriginObj.companyAccountId !==
          dataOfRow.companyAccountId ||
          ((dataOfRow.nigreret)
              ? (this.state.saveOriginObj.originalDate !==
                dataOfRow.originalDate)
              : (this.state.saveOriginObj.transDate !== dataOfRow.transDate)
          ) ||
          (this.isStatusReload(dataOfRow.targetType) &&
            this.state.saveOriginObj.paymentDesc !== dataOfRow.paymentDesc)
        ) {
          reloadData = true
        }
        new Api(
          { endpoint: `payments/cfl/${dataOfRow.targetType}/update` }).post({
          body: {
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
            'transDate': dataOfRow.transDate,
            'transDesc': dataOfRow.transDesc,
            'transId': dataOfRow.transId,
            'transName': dataOfRow.transName,
            'transTypeId': dataOfRow.transTypeId,
            'uniItra': dataOfRow.uniItra,
            'uniItraColor': dataOfRow.uniItraColor,
          },
        }).then(data => {
          updateRow(reloadData, dataOfRow)
          this.setState({
            editRowModalIsOpen: false,
            saveOriginObj: dataOfRow,
          })
        }).catch(() => this.setState({ editRowModalIsOpen: false }))
      } else {
        updateRow(false)
        this.setState({
          editRowModalIsOpen: false,
          saveOriginObj: dataOfRow,
        })
      }
    } else if (this.state.tab === 2) {
      const { updateRow } = this.props
      let expirationDate = this.state.dataOfRowGroup.expirationDate
      if (this.state.dataOfRowGroup.endDate === 'none') {
        expirationDate = null
      } else if (this.state.dataOfRowGroup.endDate === 'times') {
        let transDate = new Date()
        if (this.state.dataOfRowGroup.transDate) {
          transDate = this.state.dataOfRowGroup.transDate
        }
        if (this.state.dataOfRowGroup.transFrequencyName === 'TWO_MONTHS') {
          expirationDate = AppTimezone.moment(transDate)
            .add((Number(this.state.dataOfRowGroup.timesValue) * 2), 'month')
            .valueOf()
        } else {
          let units = this.state.dataOfRowGroup.transFrequencyName.toLowerCase()
          expirationDate = AppTimezone.moment(transDate)
            .add(Number(this.state.dataOfRowGroup.timesValue), units)
            .valueOf()
        }
      } else if (this.state.dataOfRowGroup.endDate === 'on') {
        expirationDate = this.state.dataOfRowGroup.expirationDate
      }
      let dataOfRowGroup = Object.assign({}, this.state.dataOfRowGroup)
      for (let x in dataOfRowGroup) {
        if (dataOfRowGroup[x] === undefined) {
          dataOfRowGroup[x] = null
        }
      }

      this.setState({ dataOfRowGroup })
      let frequencyDay = (this.state.dataOfRowGroup.frequencyDay)
        ? this.state.dataOfRowGroup.frequencyDay
        : null
      if (dataOfRowGroup.targetType === 'CYCLIC_TRANS' &&
        ['MONTH', 'WEEK'].includes(dataOfRowGroup.transFrequencyName) &&
        dataOfRowGroup.transDate) {
        if (dataOfRowGroup.transFrequencyName === 'WEEK') {
          frequencyDay = (AppTimezone.moment(dataOfRowGroup.transDate)
            .format('dddd')).toUpperCase()
        }
        if (dataOfRowGroup.transFrequencyName === 'MONTH') {
          frequencyDay = AppTimezone.moment(dataOfRowGroup.transDate)
            .format('D')
        }
      }
      if (dataOfRowGroup.transFrequencyName === 'WEEK' &&
        dataOfRowGroup.transDate) {
        frequencyDay = (AppTimezone.moment(dataOfRowGroup.transDate)
          .format('dddd')).toUpperCase()
      }
      if (dataOfRowGroup.transFrequencyName === 'MONTH' &&
        dataOfRowGroup.transDate) {
        frequencyDay = AppTimezone.moment(dataOfRowGroup.transDate).format('D')
      }
      const params = {
        'autoUpdateTypeName': this.state.dataOfRowGroup.autoUpdateTypeName,
        'companyAccountId': this.state.dataOfRowGroup.companyAccountId,
        'expence': this.state.dataOfRowGroup.expence,
        'expirationDate': expirationDate,
        'frequencyDay': frequencyDay,
        'lastBankDate': (this.state.dataOfRowGroup.lastBankDate)
          ? this.state.dataOfRowGroup.lastBankDate
          : null,
        'lastBankDateColor': (this.state.dataOfRowGroup.lastBankDateColor)
          ? this.state.dataOfRowGroup.lastBankDateColor
          : null,
        'lastBankTotal': (this.state.dataOfRowGroup.lastBankTotal)
          ? this.state.dataOfRowGroup.lastBankTotal
          : null,
        'notExpence': (this.state.dataOfRowGroup.notExpence)
          ? this.state.dataOfRowGroup.notExpence
          : null,
        'paymentDesc': this.state.dataOfRowGroup.paymentDesc,
        'targetType': this.state.dataOfRowGroup.targetType,
        'total': Number(this.state.dataOfRowGroup.total),
        'transDate': this.state.dataOfRowGroup.transDate,
        'transFrequencyName': this.state.dataOfRowGroup.transFrequencyName,
        'transId': this.state.dataOfRowGroup.transId,
        'transName': this.state.dataOfRowGroup.transName,
        'transTypeId': this.state.dataOfRowGroup.transTypeId,
        'updatedBy': (this.state.dataOfRowGroup.updatedBy)
          ? this.state.dataOfRowGroup.updatedBy
          : null,
      }
      new Api(
        { endpoint: `cyclic-trans/cfl/${this.state.dataOfRowGroup.targetType}/update` }).post(
        {
          body: params,
        })
        .then(data => {
          updateRow(true)
          this.setState({ editRowModalIsOpen: false })
        })
        .catch(() => this.setState({ editRowModalIsOpen: false }))
    }
  }

  setDataState = (data) => {
    this.setState({ dataOfRow: data })
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

  getSingleCyclicTrans (dataOfRow) {
    new Api({ endpoint: 'cyclic-trans/cfl/single' }).post({
      body: dataOfRow,
    })
      .then(data => {
        if (data && Array.isArray(data.transes) && data.transes.length > 0) {
          if ('asmachta' in data.transes[0] && data.transes[0].asmachta ===
            '') {
            data.transes[0].asmachta = null
          }
          const dataRow = Object.assign(JSON.parse(JSON.stringify(dataOfRow)),
            data.transes[0])
          if (!dataRow.autoUpdateTypeName) {
            dataRow.autoUpdateTypeName = 'AVG_3_MONTHS'
          }
          if (!dataRow.transFrequencyName) {
            dataRow.transFrequencyName = 'MONTH'
          }
          if (!dataRow.endDate) {
            dataRow.endDate = 'none'
          }
          if (!dataRow.expirationDate) {
            dataRow.expirationDate = AppTimezone.moment().valueOf()
          }
          dataRow.timesValue = 0
          this.setState({
            tab: 2,
            dataOfRowGroup: dataRow,
            editSum: false,
            disabledGrTab2: this.getRulesEditTab2(dataRow.targetType),
          })
        } else {
          const dataRow = JSON.parse(JSON.stringify(dataOfRow))
          if (!dataRow.autoUpdateTypeName) {
            dataRow.autoUpdateTypeName = 'AVG_3_MONTHS'
          }
          if (!dataRow.transFrequencyName) {
            dataRow.transFrequencyName = 'MONTH'
          }
          if (!dataRow.endDate) {
            dataRow.endDate = 'none'
          }
          if (!dataRow.expirationDate) {
            dataRow.expirationDate = AppTimezone.moment().valueOf()
          }
          dataRow.timesValue = 0
          this.setState({
            tab: 2,
            dataOfRowGroup: dataRow,
            editSum: false,
            disabledGrTab2: this.getRulesEditTab2(dataRow.targetType),
          })
        }
      })
      .catch(() => {
      })
  }

  getRulesEditTab1 (data) {
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
      case 'DIRECTD':
        disabledGrTab1.transDate = false
        disabledGrTab1.total = false
        break
    }
    return disabledGrTab1
  }

  getRulesEditTab2 (data) {
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
        disabledGrTab2.transFrequencyName = false
        disabledGrTab2.transName = false
        disabledGrTab2.transTypeName = false
        disabledGrTab2.account = false
        disabledGrTab2.paymentDesc = false
        disabledGrTab2.transDate = false
        disabledGrTab2.total = false
        break
    }
    return disabledGrTab2
  }

  setModalVisible (visible) {
    this.setState({ editRowModalIsOpen: visible })
  }

  setModalInsideVisible (visible) {
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
    this.setModalInsideVisible(!this.state.editModalInsideIsOpen)
  }

  render () {
    const { dataOfRow } = this.state

    const { isRtl } = this.props
    const total = getFormattedValueArray(dataOfRow.total)
    const numberStyle = cs(dataOfRow.expence,
      [styles.dataValue, { color: colors.green4 }], { color: colors.red2 })
    const rowStyle = !isRtl ? 'row-reverse' : 'row'

    return (
      <View>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.editRowModalIsOpen}
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
                  paddingTop: 15,
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
                      <TouchableOpacity onPress={() => {
                        this.setModalInsideVisible(
                          !this.state.editModalInsideIsOpen)
                      }}>
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
                  marginTop: 44,
                  marginBottom: 10,
                  paddingLeft: 0,
                  paddingRight: 10,
                  flex: 1,
                }}>
                  <KeyboardAwareScrollView enableOnAndroid>
                    {this.state.typeEditModal !== 'transDate' && (<CheckList
                      close={this.handleCloseCheckListModal}
                      setDataState={this.setDataState}
                      data={this.state.dataList}
                      value={(this.state.tab === 1)
                        ? dataOfRow
                        : this.state.dataOfRowGroup}
                      type={this.state.typeEditModal}/>)}
                    {this.state.typeEditModal === 'transDate' && (<Calendar
                      current={AppTimezone.moment((this.state.tab === 1)
                        ? ((dataOfRow.nigreret)
                          ? dataOfRow.originalDate
                          : dataOfRow.transDate)
                        : this.state.dataOfRowGroup.transDate)
                        .format('YYYY-MM-DD')}
                      markedDates={{
                        [AppTimezone.moment((this.state.tab === 1)
                          ? ((dataOfRow.nigreret)
                            ? dataOfRow.originalDate
                            : dataOfRow.transDate)
                          : this.state.dataOfRowGroup.transDate)
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
                        // day.timestamp = new Date(AppTimezone.moment(day.timestamp).format('LL, LTS')).getTime()
                        day.timestamp = AppTimezone.moment(day.dateString)
                          .valueOf()

                        if (this.state.tab === 1) {
                          if (dataOfRow.nigreret) {
                            let dataOfRowVal = Object.assign({},
                              this.state.dataOfRow)
                            dataOfRowVal.originalDate = day
                            this.setState({ dataOfRow: dataOfRowVal })
                            // this.setState({ originalDate: day.timestamp })
                            // dataOfRow.originalDate = day.timestamp
                          } else {
                            let dataOfRowVal = Object.assign({},
                              this.state.dataOfRow)
                            dataOfRowVal.transDate = day
                            this.setState({ dataOfRow: dataOfRowVal })
                            // this.setState({ transDate: day.timestamp })
                            // dataOfRow.transDate = day.timestamp
                          }
                        } else {
                          this.setState({ transDate: day })
                          let dataOfRowGroup = Object.assign({},
                            this.state.dataOfRowGroup)
                          dataOfRowGroup.transDate = day
                          this.setState({ dataOfRowGroup: dataOfRowGroup })
                        }
                        this.setModalInsideVisible(
                          !this.state.editModalInsideIsOpen)
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
                paddingTop: 15,
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
                    <TouchableOpacity onPress={() => {
                      this.setModalVisible(!this.state.editRowModalIsOpen)
                    }}>
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
                      {'עריכת'} {dataOfRow.expence
                      ? 'הוצאה'
                      : 'הכנסה'} {'קבועה'}
                    </Text>
                    <Text style={{
                      fontSize: sp(16),
                      color: '#ffffff',
                      fontFamily: fonts.semiBold,
                    }}>
                      {(this.props.searchkey && this.props.searchkey.length >
                      0 && this.props.searchkey.find(
                        (it) => it.paymentDescription === dataOfRow.paymentDesc)
                        ? this.props.searchkey.find(
                          (it) => it.paymentDescription ===
                            dataOfRow.paymentDesc).name
                        : '')}
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

              {(dataOfRow.targetType === 'CYCLIC_TRANS' ||
                dataOfRow.targetType === 'DIRECTD' ||
                dataOfRow.targetType === 'SOLEK_TAZRIM' ||
                dataOfRow.targetType === 'CCARD_TAZRIM' ||
                dataOfRow.targetType === 'LOAN_TAZRIM' ||
                dataOfRow.targetType === 'CASH') &&
              (<View style={{
                  height: 38,
                  backgroundColor: '#ffffff',
                  width: '100%',
                  marginTop: 26,
                  marginBottom: 44,
                  paddingLeft: 10,
                  paddingRight: 10,
                }}>
                  <View style={cs(
                    isRtl,
                    [
                      styles.container, {
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                    }],
                    commonStyles.rowReverse,
                  )}><View><TouchableOpacity underlayColor={'#08d3b8'}
                                             style={cs((this.state.tab === 2), [
                                               {
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
                                               shadowOffset: {
                                                 width: 0,
                                                 height: 2,
                                               },
                                               elevation: 4,
                                             })} onPress={() => {
                    const { dataOfRow } = this.state
                    this.getSingleCyclicTrans(dataOfRow)
                  }}><Text style={
                    cs((this.state.tab === 1), [
                      {
                        fontSize: sp(18),
                        fontFamily: fonts.semiBold,
                        lineHeight: 37,
                        color: '#ffffff',
                      },
                    ], {
                      color: '#0f3860',
                    })}>התנועה הקבועה כולה</Text></TouchableOpacity></View>
                    <View>
                      <TouchableOpacity
                        style={
                          cs((this.state.tab === 1), [
                            {
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
                            shadowOffset: {
                              width: 0,
                              height: 2,
                            },
                            elevation: 4,
                          })}
                        onPress={() => {
                          const { dataOfRow } = this.state
                          this.setState({
                            tab: 1,
                            editSum: false,
                            disabledGrTab1: this.getRulesEditTab1(
                              dataOfRow.targetType),
                          })
                        }}
                      >
                        <Text style={
                          cs((this.state.tab === 2), [
                            {
                              fontSize: sp(18),
                              fontFamily: fonts.semiBold,
                              lineHeight: 37,
                              color: '#ffffff',
                            },
                          ], {
                            color: '#0f3860',
                          })}
                        >תנועה זו בלבד</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {(dataOfRow.targetType !== 'CYCLIC_TRANS' &&
                dataOfRow.targetType !== 'DIRECTD' &&
                dataOfRow.targetType !== 'SOLEK_TAZRIM' &&
                dataOfRow.targetType !== 'CCARD_TAZRIM' &&
                dataOfRow.targetType !== 'LOAN_TAZRIM' &&
                dataOfRow.targetType !== 'CASH') &&
              (<View style={{
                  height: 38,
                  width: '100%',
                  paddingLeft: 10,
                  paddingRight: 10,
                }}/>
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
                {(this.state.tab === 1 && dataOfRow.targetType ===
                  'LOAN_TAZRIM') && (
                  <View style={{
                    flex: 1,
                    alignItems: 'flex-start',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                    <Text style={{
                      color: '#0f3860',
                      fontSize: sp(16),
                      lineHeight: 42,
                      textAlign: 'center',
                    }}>
                      לא ניתן לערוך תנועה בודדת מסוג הלוואה
                    </Text>
                  </View>)}
                {(this.state.tab === 1 && dataOfRow.targetType !==
                  'LOAN_TAZRIM') && (
                  <KeyboardAwareScrollView enableOnAndroid>
                    <View style={[
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                      {
                        height: 42,
                        marginBottom: 8,
                      },
                      cs(this.state.disabledGrTab1.account, { opacity: 1 },
                        { opacity: 0.3 })]}>
                      <View style={{
                        flex: 1.76,
                        alignItems: 'flex-end',
                      }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
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
                          style={[
                            cs(isRtl, commonStyles.row,
                              [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                            }]}
                          onPress={() => {
                            if (!this.state.disabledGrTab1.account) {
                              const types = this.props.accounts.map((item) => {
                                return {
                                  text: item.accountNickname,
                                  id: item.companyAccountId,
                                  selected: (item.companyAccountId ===
                                    dataOfRow.companyAccountId),
                                  account: item,
                                }
                              })
                              this.setState({
                                typeEditModal: 'companyAccountId',
                                titleModalInside: 'ח-ן',
                                dataList: types,
                              })
                              this.setModalInsideVisible(true)
                            }
                          }}>

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
                            {this.props.accounts.find(
                              a => a.companyAccountId ===
                                dataOfRow.companyAccountId).accountNickname}
                          </Text>
                          <View style={commonStyles.spaceDivider}/>
                          <AccountIcon
                            account={this.props.accounts.find(
                              a => a.companyAccountId ===
                                dataOfRow.companyAccountId)}/>
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
                        cs(this.state.disabledGrTab1.transName, { opacity: 1 },
                          { opacity: 0.3 })]}>
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
                          style={[
                            {
                              textAlign: 'right',
                              color: '#0f3860',
                              height: 42,
                              fontSize: sp(15),
                              width: '100%',
                            }, commonStyles.regularFont]}
                          onEndEditing={(e) => {
                            let dataOfRowVal = Object.assign({},
                              this.state.dataOfRow)
                            dataOfRowVal.transName = e.nativeEvent.text
                            this.setState({ dataOfRow: dataOfRowVal })
                          }}
                          onChangeText={(transName) => {
                            let dataOfRowVal = Object.assign({},
                              this.state.dataOfRow)
                            dataOfRowVal.transName = transName
                            this.setState({ dataOfRow: dataOfRowVal })
                          }}
                          value={dataOfRow.transName}
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
                        cs(this.state.disabledGrTab1.transTypeName,
                          { opacity: 1 }, { opacity: 0.3 })]}>
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
                          onPress={() => {
                            if (!this.state.disabledGrTab1.transTypeName) {
                              const types = this.props.getAccountCflTransType.map(
                                (item) => {
                                  return {
                                    text: item.transTypeName,
                                    id: item.transTypeId,
                                    selected: (item.transTypeId ===
                                      dataOfRow.transTypeId),
                                  }
                                })
                              this.setState({
                                typeEditModal: 'transTypeId',
                                titleModalInside: 'קטגוריה',
                                dataList: types,
                              })
                              this.setModalInsideVisible(true)
                            }
                          }}
                        >
                          <View style={{
                            marginRight: 'auto',
                          }}>
                            <Icon name="chevron-left" size={24}
                                  color={colors.blue34}/>
                          </View>
                          <Text
                            style={[
                              {
                                textAlign: 'right',
                                color: '#0f3860',
                                fontSize: sp(15),
                                lineHeight: 42,
                              }, commonStyles.regularFont]}
                          >
                            {this.getAccountCflTransType(
                              dataOfRow.transTypeId).transTypeName}
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
                        cs(this.state.disabledGrTab1.paymentDesc,
                          { opacity: 1 }, { opacity: 0.3 })]}>
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
                          onPress={() => {
                            if (!this.state.disabledGrTab1.paymentDesc) {
                              const paymentList = this.state.paymentList
                              const selected = paymentList.find(
                                (item) => item.id === dataOfRow.paymentDesc)
                              selected.selected = true
                              this.setState({
                                typeEditModal: 'paymentDesc',
                                titleModalInside: 'סוג תשלום',
                                dataList: paymentList,
                              })
                              this.setModalInsideVisible(true)
                            }
                          }}>
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
                            {(this.props.searchkey &&
                            this.props.searchkey.length > 0 &&
                            this.props.searchkey.find(
                              (it) => it.paymentDescription ===
                                dataOfRow.paymentDesc)
                              ? this.props.searchkey.find(
                                (it) => it.paymentDescription ===
                                  dataOfRow.paymentDesc).name
                              : '')}
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
                        cs(this.state.disabledGrTab1.asmachta, { opacity: 1 },
                          { opacity: 0.3 })]}>
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
                          editable={!this.state.disabledGrTab1.asmachta}
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
                            let dataOfRowVal = Object.assign({},
                              this.state.dataOfRow)
                            dataOfRowVal.asmachta = e.nativeEvent.text
                            this.setState({ dataOfRow: dataOfRowVal })
                          }}
                          onChangeText={(asmachta) => {
                            let dataOfRowVal = Object.assign({},
                              this.state.dataOfRow)
                            dataOfRowVal.asmachta = asmachta
                            this.setState({ dataOfRow: dataOfRowVal })
                          }}
                          value={dataOfRow.asmachta}
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
                        cs(this.state.disabledGrTab1.transDate, { opacity: 1 },
                          { opacity: 0.3 })]}>
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
                          onPress={() => {
                            if (!this.state.disabledGrTab1.transDate) {
                              this.setState({
                                typeEditModal: 'transDate',
                                titleModalInside: 'תאריך',
                              })
                              this.setModalInsideVisible(true)
                            }
                          }}>

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
                            }, commonStyles.regularFont]}>{(!dataOfRow.nigreret)
                            ? AppTimezone.moment(dataOfRow.transDate)
                              .format('DD/MM/YY')
                            : AppTimezone.moment(dataOfRow.originalDate)
                              .format('DD/MM/YY')}</Text>
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
                        cs(this.state.disabledGrTab1.total, { opacity: 1 },
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
                            editable={this.state.editSum &&
                            !this.state.disabledGrTab1.total}
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
                              let dataOfRowVal = Object.assign({},
                                this.state.dataOfRow)
                              dataOfRowVal.total = e.nativeEvent.text
                              this.setState({ dataOfRow: dataOfRowVal })
                              this.setState({ editSum: false })
                            }}
                            onChangeText={(total) => {
                              let dataOfRowVal = Object.assign({},
                                this.state.dataOfRow)
                              dataOfRowVal.total = total
                              this.setState({ dataOfRow: dataOfRowVal })
                            }}
                            value={dataOfRow.total
                              ? String(dataOfRow.total)
                              : null}
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
                            onPress={() => {
                              if (!this.state.disabledGrTab1.total) {
                                this.setState({ editSum: true })
                              }
                            }}>
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
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </KeyboardAwareScrollView>
                )}
                {(this.state.tab === 2 && this.state.dataOfRowGroup) && (
                  <KeyboardAwareScrollView enableOnAndroid>
                    <View
                      style={[
                        cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                        {
                          height: 42,
                          marginBottom: 8,
                        },
                        cs(this.state.disabledGrTab2.account, { opacity: 1 },
                          { opacity: 0.3 })]}>
                      <View style={{
                        flex: 1.76,
                        alignItems: 'flex-end',
                      }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
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
                          style={[
                            cs(isRtl, commonStyles.row,
                              [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                            }]}
                          onPress={() => {
                            if (!this.state.disabledGrTab2.account) {
                              const types = this.props.accounts.map((item) => {
                                return {
                                  text: item.accountNickname,
                                  id: item.companyAccountId,
                                  selected: (item.companyAccountId ===
                                    this.state.dataOfRowGroup.companyAccountId),
                                  account: item,
                                }
                              })
                              this.setState({
                                typeEditModal: 'companyAccountId',
                                titleModalInside: 'ח-ן',
                                dataList: types,
                              })
                              this.setModalInsideVisible(true)
                            }
                          }}>
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
                            {this.props.accounts.find(
                              a => a.companyAccountId ===
                                this.state.dataOfRowGroup.companyAccountId).accountNickname}
                          </Text>
                          <View style={commonStyles.spaceDivider}/>
                          <AccountIcon
                            account={this.props.accounts.find(
                              a => a.companyAccountId ===
                                this.state.dataOfRowGroup.companyAccountId)}/>
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
                        cs(this.state.disabledGrTab2.transName, { opacity: 1 },
                          { opacity: 0.3 })]}>
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
                          style={[
                            {
                              textAlign: 'right',
                              color: '#0f3860',
                              height: 42,
                              fontSize: sp(15),
                              width: '100%',
                            }, commonStyles.regularFont]}
                          onEndEditing={(e) => {
                            let dataOfRowGroup = Object.assign({},
                              this.state.dataOfRowGroup)
                            dataOfRowGroup.transName = e.nativeEvent.text
                            this.setState({ dataOfRowGroup: dataOfRowGroup })
                          }}
                          onChangeText={(transName) => {
                            let dataOfRowGroup = Object.assign({},
                              this.state.dataOfRowGroup)
                            dataOfRowGroup.transName = transName
                            this.setState({ dataOfRowGroup: dataOfRowGroup })
                          }}
                          value={this.state.dataOfRowGroup.transName}
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
                        cs(this.state.disabledGrTab2.transTypeName,
                          { opacity: 1 }, { opacity: 0.3 })]}>
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
                      <View
                        style={{
                          flex: 5.73,
                          backgroundColor: '#f5f5f5',
                          paddingHorizontal: 21,
                          borderBottomRightRadius: 20,
                          borderTopRightRadius: 20,
                        }}
                      >
                        <TouchableOpacity
                          style={[
                            cs(isRtl, commonStyles.row,
                              [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                            }]}
                          onPress={() => {
                            if (!this.state.disabledGrTab2.transTypeName) {
                              const types = this.props.getAccountCflTransType.map(
                                (item) => {
                                  return {
                                    text: item.transTypeName,
                                    id: item.transTypeId,
                                    selected: (item.transTypeId ===
                                      this.state.dataOfRowGroup.transTypeId),
                                  }
                                })
                              this.setState({
                                typeEditModal: 'transTypeId',
                                titleModalInside: 'קטגוריה',
                                dataList: types,
                              })
                              this.setModalInsideVisible(true)
                            }
                          }}
                        >
                          <View style={{
                            marginRight: 'auto',
                          }}>
                            <Icon name="chevron-left" size={24}
                                  color={colors.blue34}/>
                          </View>

                          <Text
                            style={[
                              {
                                textAlign: 'right',
                                color: '#0f3860',
                                fontSize: sp(15),
                                lineHeight: 42,
                              }, commonStyles.regularFont]}
                          >
                            {this.getAccountCflTransType(
                              this.state.dataOfRowGroup.transTypeId).transTypeName}
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
                        cs(this.state.disabledGrTab2.paymentDesc,
                          { opacity: 1 }, { opacity: 0.3 })]}>
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
                          onPress={() => {
                            if (!this.state.disabledGrTab2.paymentDesc) {
                              const paymentList = this.state.paymentList
                              const selected = paymentList.find(
                                (item) => item.id ===
                                  this.state.dataOfRowGroup.paymentDesc)
                              selected.selected = true
                              this.setState({
                                typeEditModal: 'paymentDesc',
                                titleModalInside: 'סוג תשלום',
                                dataList: paymentList,
                              })
                              this.setModalInsideVisible(true)
                            }
                          }}>

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
                            {(this.props.searchkey &&
                            this.props.searchkey.length > 0 &&
                            this.props.searchkey.find(
                              (it) => it.paymentDescription ===
                                this.state.dataOfRowGroup.paymentDesc)
                              ? this.props.searchkey.find(
                                (it) => it.paymentDescription ===
                                  this.state.dataOfRowGroup.paymentDesc).name
                              : '')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {(this.state.dataOfRowGroup.targetType ===
                      'CYCLIC_TRANS') && (<View
                      style={[
                        cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                        {
                          height: 42,
                          marginBottom: 8,
                        },
                        cs(this.state.disabledGrTab2.total, { opacity: 1 },
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
                            editable={this.state.editSum &&
                            !this.state.disabledGrTab2.total}
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
                              let dataOfRowGroup = Object.assign({},
                                this.state.dataOfRowGroup)
                              dataOfRowGroup.total = e.nativeEvent.text
                              this.setState({
                                dataOfRowGroup: dataOfRowGroup,
                                editSum: false,
                              })
                            }}
                            onChangeText={(total) => {
                              let dataOfRowGroup = Object.assign({},
                                this.state.dataOfRowGroup)
                              dataOfRowGroup.total = total
                              this.setState({ dataOfRowGroup: dataOfRowGroup })
                            }}
                            value={this.state.dataOfRowGroup.total ? String(
                              this.state.dataOfRowGroup.total) : null}
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
                            onPress={() => {
                              if (!this.state.disabledGrTab2.total) {
                                this.setState({ editSum: true })
                              }
                            }}>
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
                                numberStyle,
                                {
                                  fontSize: sp(15),
                                  lineHeight: 42,
                                  color: '#0f3860',
                                },
                                commonStyles.regularFont]}>{getFormattedValueArray(
                                this.state.dataOfRowGroup.total)[0]}</Text>
                              <Text style={[
                                styles.fractionalPart,
                                {
                                  fontSize: sp(15),
                                  lineHeight: 42,
                                  color: '#0f3860',
                                },
                                commonStyles.regularFont]}>.{getFormattedValueArray(
                                this.state.dataOfRowGroup.total)[1]}</Text>
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>)}

                    {(this.state.dataOfRowGroup.targetType !== 'CCARD_TAZRIM' &&
                      this.state.dataOfRowGroup.targetType !==
                      'SOLEK_TAZRIM') && (
                      <View
                        style={[
                          cs(!isRtl, commonStyles.row,
                            [commonStyles.rowReverse]),
                          {
                            height: 42,
                            marginBottom: 8,
                          },
                          cs(this.state.disabledGrTab2.transFrequencyName,
                            { opacity: 1 }, { opacity: 0.3 })]}>
                        <View style={{
                          flex: 1.76,
                          alignItems: 'flex-end',
                        }}>
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
                            style={[
                              cs(isRtl, commonStyles.row,
                                [commonStyles.rowReverse]), {
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                              }]}
                            onPress={() => {
                              if (!this.state.disabledGrTab2.transFrequencyName) {
                                const transFrequencyName = this.state.transFrequencyName
                                const selected = transFrequencyName.find(
                                  (item) => item.id ===
                                    this.state.dataOfRowGroup.transFrequencyName)
                                selected.selected = true
                                this.setState({
                                  typeEditModal: 'transFrequencyName',
                                  titleModalInside: 'תדירות',
                                  dataList: transFrequencyName,
                                })
                                this.setModalInsideVisible(true)
                              }
                            }}>

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
                              {this.state.transFrequencyName.find(
                                (item) => item.id ===
                                  this.state.dataOfRowGroup.transFrequencyName).text}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>)}

                    {(this.state.dataOfRowGroup.targetType === 'DIRECTD') &&
                    (<View
                      style={[
                        cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                        {
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
                        }}>החל מתאריך</Text>
                      </View>
                      <View style={{
                        flex: 5.73,
                        paddingHorizontal: 21,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                      }}>
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
                          {AppTimezone.moment(
                            this.state.dataOfRowGroup.transDate)
                            .format('DD/MM/YY')}
                        </Text>
                      </View>
                    </View>)}
                    {(this.state.dataOfRowGroup.targetType === 'DIRECTD') &&
                    (<View
                      style={[
                        cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                        {
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
                        }}>תאריך סיום</Text>
                      </View>
                      <View style={{
                        flex: 5.73,
                        paddingHorizontal: 21,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                      }}>
                        <Text style={[
                          styles.dataRowLevel3Text, {
                            fontSize: sp(15),
                            color: '#0f3860',
                            lineHeight: 42,
                          }, commonStyles.regularFont]} numberOfLines={1}
                              ellipsizeMode="tail">ללא
                          סיום</Text>
                      </View>
                    </View>)}

                    {(this.state.dataOfRowGroup.targetType ===
                      'CYCLIC_TRANS') && (<View
                      style={[
                        cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                        {
                          height: 42,
                          marginBottom: 8,
                        },
                        cs(this.state.disabledGrTab2.transDate, { opacity: 1 },
                          { opacity: 0.3 })]}>
                      <View style={{
                        flex: 1.76,
                        alignItems: 'flex-end',
                      }}>
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
                          style={[
                            cs(isRtl, commonStyles.row,
                              [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                            }]}
                          onPress={() => {
                            if (!this.state.disabledGrTab2.transDate) {
                              this.setState({
                                typeEditModal: 'transDate',
                                titleModalInside: 'החל מתאריך',
                              })
                              this.setModalInsideVisible(true)
                            }
                          }}>
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
                            this.state.dataOfRowGroup.transDate)
                            .format('DD/MM/YY')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>)}

                    {(this.state.dataOfRowGroup.targetType === 'CASH' ||
                      this.state.dataOfRowGroup.targetType === 'CCARD_TAZRIM' ||
                      this.state.dataOfRowGroup.targetType === 'SOLEK_TAZRIM' ||
                      this.state.dataOfRowGroup.targetType === 'DIRECTD' ||
                      this.state.dataOfRowGroup.targetType ===
                      'CYCLIC_TRANS') && (
                      <View
                        style={[
                          cs(!isRtl, commonStyles.row,
                            [commonStyles.rowReverse]), {
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
                            style={[
                              cs(isRtl, commonStyles.row,
                                [commonStyles.rowReverse]), {
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                              }]}
                            onPress={() => {
                              const autoUpdateTypeName = this.state.autoUpdateTypeName
                              const selected = autoUpdateTypeName.find(
                                (item) => item.id ===
                                  this.state.dataOfRowGroup.autoUpdateTypeName)
                              selected.selected = true
                              this.setState({
                                typeEditModal: 'autoUpdateTypeName',
                                titleModalInside: 'סכום לתזרים',
                                dataList: autoUpdateTypeName,
                              })
                              this.setModalInsideVisible(true)
                            }}>
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
                              {(this.state.autoUpdateTypeName.find(
                                (item) => item.id ===
                                  this.state.dataOfRowGroup.autoUpdateTypeName))
                                ? this.state.autoUpdateTypeName.find(
                                  (item) => item.id ===
                                    this.state.dataOfRowGroup.autoUpdateTypeName).text
                                : ''}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>)}

                    {(this.state.dataOfRowGroup.targetType ===
                      'CYCLIC_TRANS') && (<View
                      style={[
                        cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                        {
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
                          style={[
                            cs(isRtl, commonStyles.row,
                              [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                            }]}
                          onPress={() => {
                            const endDate = this.state.endDate
                            const selected = endDate.find((item) => item.id ===
                              this.state.dataOfRowGroup.endDate)
                            selected.selected = true
                            this.setState({
                              typeEditModal: 'endDate',
                              titleModalInside: 'תאריך סיום',
                              dataList: endDate,
                            })
                            this.setModalInsideVisible(true)
                          }}>
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
                            },
                            commonStyles.regularFont]}> {this.state.endDate.find(
                            (item) => item.id ===
                              this.state.dataOfRowGroup.endDate).text} {(this.state.dataOfRowGroup.endDate ===
                            'on')
                            ? AppTimezone.moment(
                              this.state.dataOfRowGroup.expirationDate)
                              .format('DD/MM/YY')
                            : (this.state.dataOfRowGroup.endDate === 'times')
                              ? this.state.dataOfRowGroup.timesValue + ' פעמים'
                              : ''}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>)}

                    {(this.state.dataOfRowGroup.targetType === 'LOAN_TAZRIM') &&
                    (<View
                      style={[
                        cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                        {
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
                          style={[
                            styles.dataRowLevel3Text, {
                              fontSize: sp(15),
                              color: '#0f3860',
                              lineHeight: 42,
                            }, commonStyles.regularFont]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {AppTimezone.moment(
                            this.state.dataOfRowGroup.transDate).format('DD')}
                        </Text>
                      </View>
                    </View>)}
                    {(this.state.dataOfRowGroup.targetType === 'LOAN_TAZRIM') &&
                    (<View
                      style={[
                        cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                        {
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
                        }}>תאריך סיום</Text>
                      </View>
                      <View style={{
                        flex: 5.73,
                        paddingHorizontal: 21,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                      }}>
                        <Text style={[
                          styles.dataRowLevel3Text, {
                            fontSize: sp(15),
                            color: '#0f3860',
                            lineHeight: 42,
                          }, commonStyles.regularFont]} numberOfLines={1}
                              ellipsizeMode="tail">ללא
                          סיום</Text>
                      </View>
                    </View>)}
                    {(this.state.dataOfRowGroup.targetType === 'LOAN_TAZRIM') &&
                    (<View
                      style={[
                        cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]),
                        {
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
                            numberStyle,
                            {
                              fontSize: sp(15),
                              lineHeight: 42,
                              color: '#0f3860',
                            },
                            commonStyles.regularFont]}>{getFormattedValueArray(
                            this.state.dataOfRowGroup.total)[0]}</Text>
                          <Text style={[
                            styles.fractionalPart,
                            {
                              fontSize: sp(15),
                              lineHeight: 42,
                              color: '#0f3860',
                            },
                            commonStyles.regularFont]}>.{getFormattedValueArray(
                            this.state.dataOfRowGroup.total)[1]}</Text>
                        </Text>
                      </View>
                    </View>)}
                  </KeyboardAwareScrollView>
                )}
              </View>
            </View>
          </SafeAreaView>
        </Modal>

        <TouchableOpacity
          onPress={() => {
            const { dataOfRow } = this.state
            this.setState({
              saveOriginObj: JSON.parse(JSON.stringify(dataOfRow)),
              tab: 1,
              editSum: false,
              disabledGrTab1: this.getRulesEditTab1(dataOfRow.targetType),
            })
            this.setModalVisible(true)
          }}>
          <View style={styles.categoryEditBtnWrapper}>
            <CustomIcon
              name="pencil"
              size={18}
              color={colors.blue7}
            />
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}
