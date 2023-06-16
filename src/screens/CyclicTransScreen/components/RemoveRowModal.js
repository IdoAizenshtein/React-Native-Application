import React, {PureComponent} from 'react'
import {Modal, Text, TouchableOpacity, View, SafeAreaView} from 'react-native'
import {withTranslation} from 'react-i18next'
import {colors, fonts} from '../../../styles/vars'
import styles from '../CyclicTransStyles'
import CustomIcon from '../../../components/Icons/Fontello'
import {combineStyles as cs, sp} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
// import { SafeAreaView } from 'react-native-safe-area-context';

@withTranslation()
export default class RemoveRowModal extends PureComponent {
    removeItem = () => {
      const { removeItem, item, isRecommendation } = this.props
      removeItem(item, isRecommendation)
    };
    setModalVisible = (...params) => () => {
      const { setModalVisible } = this.props
      setModalVisible(params[0], params[1], params[2])
    };

    render () {
      const { item, isRtl, isRecommendation } = this.props
      const rowStyle = isRtl ? 'row-reverse' : 'row'
      return (
        <Modal
          animationType="slide"
          transparent={false}
          visible
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
                  <View>
                    <TouchableOpacity onPress={this.setModalVisible(null, null, false)}>
                      <Text style={{
                        fontSize: sp(16),
                        color: '#ffffff',
                        fontFamily: fonts.semiBold,
                      }}>ביטול</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: sp(20), color: '#ffffff', fontFamily: fonts.semiBold }}>
                      {(isRecommendation) ? 'הסרת' : 'מחיקת'} {'תנועה קבועה'}
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity
                      onPress={this.removeItem}>
                      <Text style={{
                        fontSize: sp(16),
                        color: '#ffffff',
                        fontFamily: fonts.semiBold,
                      }}>{(isRecommendation) ? 'הסרה' : 'מחיקה'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={{
                width: '100%',
                backgroundColor: '#ffffff',
                marginTop: 38,
                marginBottom: 0,
                paddingLeft: 0,
                paddingRight: 10,
              }} />

              {isRecommendation && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  alignContent: 'center',
                  flex: 1,
                }}>
                  <Text style={{
                    textAlign: 'center',
                    fontSize: sp(18),
                    color: colors.blue7,
                    lineHeight: 28,
                    fontFamily: fonts.regular,
                  }}>
                    {'האם ברצונכם להסיר את התנועה המומלצת'}{'\n'}{item.transName}{' ?'}
                  </Text>
                </View>
              )}
              {!isRecommendation && (
                <View style={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  alignContent: 'center',
                  flex: 1,
                }}>
                  <View style={{
                    justifyContent: 'center',
                    alignSelf: 'center',
                    alignContent: 'center',
                    marginBottom: 10,
                  }}>
                    <CustomIcon
                      name="exclamation-triangle"
                      size={20}
                      color={colors.red2}
                    />
                  </View>
                  <View style={{
                    flexDirection: rowStyle,
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    alignSelf: 'center',
                    alignContent: 'center',
                    flex: 1,
                  }}>
                    <Text style={{
                      textAlign: 'right',
                      fontSize: sp(18),
                      color: colors.blue7,
                      lineHeight: 28,
                      fontFamily: fonts.semiBold,
                    }}>
                      {'שימו לב: '}
                    </Text>
                    <Text style={{
                      textAlign: 'right',
                      fontSize: sp(18),
                      color: colors.blue7,
                      lineHeight: 28,
                      fontFamily: fonts.regular,
                    }}>
                      {`התנועה ${item.transName} תימחק `}{'\n'}{'יחד עם כל המופעים העתידיים שלה'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </SafeAreaView>
        </Modal>
      )
    }
}
