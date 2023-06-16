import React, { PureComponent } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import {
  combineStyles as cs,
  getTransCategoryIcon,
  sp,
} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles from '../ChecksStyles'
import { colors, fonts } from '../../../styles/vars'
import CustomIcon from '../../../components/Icons/Fontello'
import AccountIcon from '../../../components/AccountIcon/AccountIcon'
import EditableTextInput from '../../../components/FormInput/EditableTextInput'
import EditRowModal from './EditRowModal'
import {
  accountCflCheckDetailsApi,
  accountCflDataUpdateApi,
  updateCheckRowApi,
} from '../../../api'
import BankTransSlider from './BankTransSlider'
import { exampleCompany } from '../../../redux/constants/account'

@withTranslation()
export default class SecondLevelRow extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isEdit: false,
      chequeComment: props.item.chequeComment,
      inProgress: true,
      details: null,
    }
    const { isOpen } = props
    setTimeout(() => {
      if (isOpen) {this.getDetails()}
    }, 400)
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { isOpen } = this.props
    const getIsOpenProps = nextProps.isOpen

    if (getIsOpenProps && getIsOpenProps !== isOpen) {
      setTimeout(() => {
        this.getDetails()
      }, 500)
    }
  }

  getDetails = () => {
    const { item, account } = this.props
    if (item.pictureLink && !this.state.details) {
      return accountCflCheckDetailsApi.post({
        body: {
          companyAccountId: item.companyAccountId,
          folderName: `${account.bankId}${account.bankSnifId}${account.bankAccountId}`,
          pictureLink: item.pictureLink,
          bankTransId: item.chequePaymentId,
        },
      })
        .then(details => this.setState({
          details,
          inProgress: false,
        }))
        .catch(() => this.setState({ inProgress: false }))
    }
  }

  handleChangeCommentDesc = (chequeComment) => this.setState({ chequeComment })

  handleUpdate = () => {
    const { chequeComment } = this.state
    const {
      item,
    } = this.props
    this.setState({ isEdit: false })
    this.updateRow({
      chequeComment: chequeComment,
      chequeNo: item.chequeNo,
      chequePaymentId: item.chequePaymentId,
      companyAccountId: item.companyAccountId,
      total: item.total,
      transTypeId: item.transTypeId,
      userDescription: item.mainDescription,
      dueDate: item.dueDate,
    })
  }

  handleToggleEdit = (val, update) => {
    if (val === true || val === false) {
      this.setState({ isEdit: !val })
      if (val === true && update) {
        this.handleUpdate()
      }
    } else {
      this.setState({ isEdit: !this.state.isEdit })
    }
  }
  handleToggleEditPress = (val, update) => () => {
    this.handleToggleEdit(val, update)
  }

  deleteOperationApi = (val, update) => () => {
    const {
      deleteOperationApi,
    } = this.props
    deleteOperationApi(val, update)
  }

  prepareUpdateRow = (item) => {
    if (item.targetType !== 'BANK_TRANS') {
      const req = {
        chequeComment: item.chequeComment,
        chequePaymentId: item.chequePaymentId,
        companyAccountId: item.companyAccountId,
        total: item.total,
        transTypeId: item.transTypeId.transTypeId,
        userDescription: item.userDescription,
        dueDate: item.dueDate,
        biziboxMutavId: item.biziboxMutavId,
      }
      if (item.chequeNo !== undefined && item.chequeNo !== '') {
        req.chequeNo = item.chequeNo
      }
      this.updateRow(req)
    } else {
      this.updateRowBankTrans({
        companyAccountId: item.companyAccountId,
        companyId: exampleCompany.isExample
          ? '856f4212-3f5f-4cfc-b2fb-b283a1da2f7c'
          : this.props.companyId,
        transId: item.chequePaymentId,
        transName: item.userDescription,
        transTypeId: item.transTypeId.transTypeId,
      })
    }
  }

  updateRow = (params) => {
    updateCheckRowApi.post({
      body: params,
    }).then(data => {
      this.props.onRefresh()
    }).catch(() => {

    })
  }

  updateRowBankTrans = (params) => {
    accountCflDataUpdateApi.post({
      body: params,
    }).then(data => {
      this.props.onRefresh()
    }).catch(() => {

    })
  }

  render () {
    const {
      isOpen,
      isRtl,
      item,
      accounts,
      screenSwitchState,
      companyId,
      renderTextYellow,
      selectedAccountIds,
    } = this.props

    const { isEdit, chequeComment } = this.state
    const withinRowStyles = cs(isRtl, commonStyles.row, commonStyles.rowReverse)

    return (
      <View style={styles.dataRowLevel3Wrapper}>
        <View style={[
          withinRowStyles, {
            backgroundColor: '#d9e7ee',
            paddingHorizontal: 6,
            height: 122,
          }]}>
          <View style={{
            flex: 10,
          }}>
            <EditRowModal
              selectedAccountIds={selectedAccountIds}
              accounts={accounts}
              companyId={companyId}
              screenSwitchState={screenSwitchState}
              item={item}
              updateRow={this.prepareUpdateRow}
            />
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
                    {item.account.accountNickname}
                  </Text>
                  <View style={commonStyles.spaceDivider}/>
                  <AccountIcon account={item.account}/>
                </View>
              </View>
              <View style={{
                flex: 10,
              }}/>
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
                  {item.statusText}
                </Text>
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
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    fontSize: sp(16),
                    color: colors.blue7,
                    fontFamily: fonts.regular,
                  }}>
                  {'מספר צ\'ק:'} {item.chequeNo &&
                item.chequeNo.toString().length > 7
                  ? renderTextYellow(
                    item.chequeNo.toString().substring(0, 7) + '..')
                  : renderTextYellow(item.chequeNo)}
                </Text>
              </View>
              <View style={{
                flex: 10,
              }}/>
              <View style={{
                flex: 50,
              }}>
                <View
                  style={cs(isRtl, commonStyles.row, [commonStyles.rowReverse],
                    {
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      alignItems: 'flex-end',
                    })}>
                  <View>
                    <CustomIcon
                      name={getTransCategoryIcon(item.transType.iconType)}
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
                        }}>{item.transType.transTypeName}</Text>
                </View>
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
                flex: 1,
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
              }}>
                <Text style={{
                  fontSize: sp(16),
                  color: colors.blue7,
                  fontFamily: fonts.regular,
                }}>
                  {'מקור הצ\'ק:'} {item.programName}
                </Text>
              </View>
            </View>
            <View style={[
              withinRowStyles, {
                height: 32,
                alignItems: 'center',
                justifyContent: 'flex-end',
                alignSelf: 'center',
                alignContent: 'center',
                paddingVertical: 5,
              }]}>
              {item.targetType !== 'BANK_TRANS' && (
                <TouchableOpacity
                  onPress={this.handleToggleEditPress(isEdit, true)}>
                  <View style={styles.categoryEditBtnWrapper}>
                    <Image style={{
                      width: 18.5,
                      height: 16.5,
                    }}
                           source={require(
                             'BiziboxUI/assets/commentIcon.png')}/>
                  </View>
                </TouchableOpacity>
              )}
              <View style={commonStyles.spaceDividerDouble}/>
              <EditableTextInput
                handleToggleIsEdit={this.handleToggleEdit}
                hideIcon
                isEditProp={isEdit}
                isEditable={item.targetType !== 'BANK_TRANS' && isOpen}
                textInputStyle={styles.dataDescInput}
                textStyle={cs(isOpen, [
                  styles.dataValue, commonStyles.regularFont, {
                    fontSize: sp(16),
                    color: colors.blue7,
                    fontFamily: fonts.regular,
                    direction: 'ltr',
                    textAlign: 'right',
                  }, { flex: 0 }], {
                  fontFamily: fonts.bold,
                  direction: 'ltr',
                  textAlign: 'right',
                })}
                value={(isEdit || !chequeComment.length)
                  ? chequeComment
                  : renderTextYellow(chequeComment)}
                onChangeText={this.handleChangeCommentDesc}
                onSubmit={this.handleUpdate}
              />
            </View>
          </View>
          {item.isRemovable && (
            <View style={{
              flex: 10,
            }}>
              <TouchableOpacity
                onPress={this.deleteOperationApi(item, true)}>
                <View style={styles.categoryEditBtnWrapper}>
                  <CustomIcon
                    name="trash"
                    size={18}
                    color={colors.blue36}
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {item.pictureLink ? (
          <BankTransSlider
            isRtl={isRtl}
            parentIsOpen={this.state.details}
            inProgress={this.state.inProgress}
            details={this.state.details}
            bankTrans={item}
          />
        ) : null}
      </View>
    )
  }
}
