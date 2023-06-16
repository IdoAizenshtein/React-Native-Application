import React, { PureComponent } from 'react'
import { Modal, Text, TouchableOpacity, View, SafeAreaView } from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context';
import { withTranslation } from 'react-i18next'
import { colors, fonts } from '../../../styles/vars'
import styles from '../BankMatchStyles'
import { combineStyles as cs, sp } from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import { Card } from './Card'

@withTranslation()
export default class RemoveRowModal extends PureComponent {
  removeItem = (type) => () => {
    const { removeItem, item } = this.props
    removeItem(item, type)
  }
  setModalVisible = (...params) => () => {
    const { setModalVisible } = this.props
    setModalVisible(params[0], params[1])
  }

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
                  <TouchableOpacity onPress={this.setModalVisible(null, false)}>
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
                    {'מחיקת תנועה צפויה'}
                  </Text>
                </View>
                <View>
                  {!Card.showIconRef(item.targetTypeName) && (
                    <TouchableOpacity onPress={this.removeItem(false)}>
                      <Text style={{
                        fontSize: sp(16),
                        color: '#ffffff',
                        fontFamily: fonts.semiBold,
                      }}>מחיקה</Text>
                    </TouchableOpacity>
                  )}
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
            }}/>

            <View style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'center',
              alignSelf: 'center',
              alignContent: 'center',
              paddingHorizontal: 10,
            }}>
              {Card.showIconRef(item.targetTypeName) && (
                <Text style={{
                  textAlign: 'center',
                  fontSize: sp(18),
                  color: colors.blue7,
                  lineHeight: 28,
                  fontFamily: fonts.regular,
                }}>
                  {'האם ברצונך למחוק את התנועה'} {targetName} {'עבור החודש הנוכחי או למחוק את התנועה הקבועה כולה?'}
                </Text>)}
              {!Card.showIconRef(item.targetTypeName) && (
                <Text style={{
                  textAlign: 'center',
                  fontSize: sp(18),
                  color: colors.blue7,
                  lineHeight: 28,
                  fontFamily: fonts.regular,
                }}>
                  {'התנועה'} {targetName} {'תימחק מהתזרים ללא אפשרות שיחזור, האם להמשיך?'}
                </Text>)}
            </View>

            {Card.showIconRef(item.targetTypeName) && (
              <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-end',
                paddingHorizontal: 10,
                marginBottom: 20,
              }}>
                <TouchableOpacity
                  style={[
                    {
                      height: 45,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      backgroundColor: '#0f3860',
                      borderRadius: 5,
                      marginBottom: 10,
                    }]}
                  onPress={this.removeItem(false)}>
                  <Text
                    style={[
                      styles.btnMatch,
                      { fontFamily: fonts.semiBold }]}>{'תנועה זו בלבד'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    {
                      height: 45,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      backgroundColor: '#0f3860',
                      borderRadius: 5,
                    }]}
                  onPress={this.removeItem(true)}>
                  <Text
                    style={[
                      styles.btnMatch,
                      { fontFamily: fonts.semiBold }]}>{'התנועה הקבועה כולה'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    )
  }
}
