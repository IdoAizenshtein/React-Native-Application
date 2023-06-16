import React, { Fragment, PureComponent } from 'react'
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context';
import { withTranslation } from 'react-i18next'
import EditableTextInput from 'src/components/FormInput/EditableTextInput'
import styles from '../SlikaEditModalStyles'
import tabStyles
  from '../../../../../components/BaseTokenTab/BaseTokenTabStyles'
import { colors, fonts } from '../../../../../../../styles/vars'
import commonStyles from '../../../../../../../styles/styles'
import { combineStyles as cs, sp } from '../../../../../../../utils/func'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { isToday } from '../../../../../../../utils/date'
import AccountIcon from 'src/components/AccountIcon/AccountIcon'

@withTranslation()
export default class SlikaDetails extends PureComponent {
  constructor (props) {
    super(props)
    const types = this.props.accounts.filter((it) => it.currency === 'ILS')
    this.state = {
      modalAlertChangeAccounts: false,
      modalChangeAccounts: false,
      dataList: types,
      account: types.find(
        (it) => it.companyAccountId === this.props.creditCard.companyAccountId),
    }
  }

  openModalChangeAccounts = () => {
    this.setState({
      modalChangeAccounts: true,
    })
  }
  closeModalChangeAccounts = () => {
    this.setState({
      modalChangeAccounts: false,
      modalAlertChangeAccounts: this.state.account.companyAccountId !==
        this.props.creditCard.companyAccountId,
    })
  }

  changeAccounts = (acc) => () => {
    this.setState({
      account: acc,
    })
  }

  cancelChangeAcc = () => {
    const types = this.props.accounts.filter((it) => it.currency === 'ILS')
    this.setState({
      account: types.find(
        (it) => it.companyAccountId === this.props.creditCard.companyAccountId),
      modalAlertChangeAccounts: false,
    })
  }

  changeAcc = () => {
    this.setState({
      modalAlertChangeAccounts: false,
    })
    const { changeAcc } = this.props
    const {
      account,
    } = this.state
    changeAcc(account)
  }

  render () {
    const { t, onRemove, name, onChangeName, isRtl } = this.props
    const {
      modalChangeAccounts,
      dataList,
      account,
      modalAlertChangeAccounts,
    } = this.state
    return (
      <Fragment>
        <ScrollView
          style={styles.detailsModalBody}
          contentContainerStyle={styles.detailsContainer}
        >
          <View style={styles.detailsRow}>
            <View style={styles.detailsLeftPart}>
              <EditableTextInput
                isEditable
                maxLength={19}
                hideIcon
                textStyle={styles.detailsLeftText}
                value={name}
                onChangeText={onChangeName}
              />
            </View>
            <View style={styles.detailsRightPart}>
              <Text style={styles.detailsRightText}>{t(
                'settings:slikaTab:editSlika')}</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <TouchableOpacity style={[
              styles.detailsLeftPart, {
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }]} onPress={this.openModalChangeAccounts}>
              <View style={{
                marginRight: 'auto',
                marginLeft: 5,
              }}>
                <Icon name="chevron-left" size={24} color={colors.blue34}/>
              </View>
              <Text
                style={styles.detailsRightText}>{account.accountNickname}</Text>
              <View style={{ paddingHorizontal: 2 }}><AccountIcon
                account={account}/></View>
            </TouchableOpacity>
            <View style={styles.detailsRightPart}>
              <Text style={styles.detailsRightText}>{t(
                'settings:slikaTab:account')}</Text>
            </View>
          </View>
          <View style={styles.detailsLastRow}>
            <TouchableOpacity onPress={onRemove}>
              <Text style={tabStyles.modalLinkText}>
                {t('settings:slikaTab:deleteSlika')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalChangeAccounts}
        >
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
                      {'חשבונות בנק'}
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity onPress={this.closeModalChangeAccounts}>
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
                {dataList && dataList.length > 1 && (
                  <ScrollView
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
                        paddingBottom: 0,
                      }]}>
                    {dataList.map((item, i) => (
                      <TouchableOpacity
                        onPress={this.changeAccounts(item)}
                        key={item.companyAccountId}
                        style={{
                          flexDirection: 'row-reverse',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: 45,
                          marginRight: 20,
                          borderTopLeftRadius: 21,
                          borderBottomLeftRadius: 21,
                          backgroundColor: (item.companyAccountId ===
                            account.companyAccountId) ? '#f5f5f5' : '#ffffff',
                        }}>

                        <View style={{
                          flex: 12,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          {item.companyAccountId === account.companyAccountId &&
                          (
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
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }}>
                          {(item && !isToday(item.balanceLastUpdatedDate)) &&
                          <Text
                            style={{ color: colors.red }}>{` - ${t(
                            'bankAccount:notUpdated')}`}</Text>}
                          <Text
                            style={[
                              styles.dataRowLevel3Text, {
                                fontSize: sp(15),
                                lineHeight: 42,
                              }, commonStyles.regularFont]}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {item.accountNickname} {'(₪)'}
                          </Text>
                          <View style={{ paddingHorizontal: 2 }}><AccountIcon
                            account={item}/></View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
          </SafeAreaView>
        </Modal>
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalAlertChangeAccounts}
        >
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
                <View style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    fontSize: sp(20),
                    color: '#ffffff',
                    fontFamily: fonts.semiBold,
                    textAlign: 'center',
                  }}>
                    {'החלפת חשבון בנק המקושר לסולק'}
                  </Text>
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
                <ScrollView
                  style={styles.confirmRemoveModalBody}
                  contentContainerStyle={styles.confirmRemoveContainer}
                >
                  <Image
                    style={[
                      styles.imgIcon,
                      {
                        width: 70,
                        height: 51,
                        marginBottom: 20,
                      }]}
                    source={require('BiziboxUI/assets/swichIcon.png')}
                  />

                  <Text style={styles.confirmRemoveTitle1}>
                    {t('settings:slikaTab:changeSlikaAcc',
                      { name: account.accountNickname.replace(/"/g, '') })}
                  </Text>

                  <Text
                    style={styles.confirmRemoveDesc1}>{t(
                    'settings:slikaTab:changeSlikaAccDesc')}</Text>

                  <TouchableOpacity style={[
                    tabStyles.modalBtn, {
                      marginTop: 20,
                    }]} onPress={this.changeAcc}>
                    <Text style={tabStyles.modalBtnText}>{'אישור'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={this.cancelChangeAcc}>
                    <Text style={tabStyles.modalLinkText}>{t(
                      'common:cancel')}</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </Fragment>

    )
  }
}
