import React, { PureComponent } from 'react'
import { Modal, Text, TouchableOpacity, View, SafeAreaView } from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context';
import { withTranslation } from 'react-i18next'
import { colors, fonts } from '../../../styles/vars'
import styles from '../BankMatchStyles'
import { combineStyles as cs, sp } from '../../../utils/func'
import commonStyles from '../../../styles/styles'

@withTranslation()
export default class RemoveRowFromListModal extends PureComponent {
  removeItem = (type) => () => {
    const { removeItem, item } = this.props
    removeItem(item, type)
  }

    setModalVisible = (param, param2) => () => {
      const { setModalVisible } = this.props
      setModalVisible(param, param2)
    };

    render () {
      const { item, isRtl } = this.props
      const targetName = item.bankTransId ? item.transDescAzonly : item.targetName

      return (
        <Modal
          animationType="slide"
          transparent={false}
          visible
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
                  [styles.container, {
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }],
                  commonStyles.rowReverse,
                )}>
                  <View>
                    <TouchableOpacity onPress={this.setModalVisible(null, false)}>
                      <Text style={{
                        fontSize: sp(16),
                        color: '#ffffff',
                        fontFamily: fonts.semiBold,
                      }}>ביטול</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: sp(20), color: '#ffffff', fontFamily: fonts.semiBold }}>
                      {'הסרת תנועה מהרשימה'}
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity onPress={this.removeItem(false)}>
                      <Text style={{
                        fontSize: sp(16),
                        color: '#ffffff',
                        fontFamily: fonts.semiBold,
                      }}>הסרה</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={{
                width: '100%',
                backgroundColor: '#ffffff',
                marginTop: 38,
                marginBottom: 0,
                paddingLeft: 10,
                paddingRight: 10,
              }} />

              <View style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                alignContent: 'center',
                paddingHorizontal: 10,
                paddingVertical: 10,
              }}>
                <Text style={{
                  textAlign: 'center',
                  fontSize: sp(18),
                  color: colors.blue7,
                  lineHeight: 28,
                  fontFamily: fonts.regular,
                }}>
                  {'התנועה'} {targetName} {'תוסר מהרשימה, האם להמשיך?'}
                </Text>
                <Text style={{
                  textAlign: 'center',
                  fontSize: sp(18),
                  color: colors.blue7,
                  lineHeight: 28,
                  fontFamily: fonts.regular,
                }}>
                  {'הערה: הסרה אינה משפיעה על תנועת הבנק בפועל'}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      )
    }
}
