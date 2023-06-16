import React, { Fragment, PureComponent } from 'react'
import { Text, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import styles from '../CyclicTransStyles'
import RowThirdLevel from './RowThirdLevel'
import { Icon } from 'react-native-elements'
import CustomIcon from '../../../components/Icons/Fontello'
import Swipeout from 'react-native-swipeout'
import { colors, fonts } from '../../../styles/vars'
import { sp } from 'src/utils/func'

@withTranslation()
export default class RowSecondLevel extends PureComponent {
  static defaultProps = {
    onEditCategory: () => () => null,
    onUpdateBankTrans: () => null,
  }

  render () {
    const {
        isRtl,
        data,
        accounts,
        t,
        account,
        onRefresh,
        companyId,
        loaded,
        isRecommendation,
        handleRemoveRowModalCb,
        approveRecommendationCb,
        updateTransactionCb,
        isParentOpened,
        transIdOpened,
        isTransIdRemove,
        deleteParamNav,
        showAlert,
        isDeleted,
      } = this.props

      return (
        <View>
          {data.map((item, index) => {
            const right = [
              {
                backgroundColor: '#45b7ec',
                component: (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Icon size={20} color="#fff" name="add" />
                    <Text style={{
                      color: '#fff',
                      fontSize: sp(14),
                      fontFamily: fonts.regular,
                    }}>הוספה</Text>
                  </View>
                ),
                onPress: () => {
                  approveRecommendationCb(item)
                },
              },
            ]
            const left = [
              {
                backgroundColor: '#db3232',
                component: (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <CustomIcon
                      name="trash"
                      size={20}
                      color={colors.white}
                    />
                    <Text
                      style={{ color: '#fff', fontSize: sp(14), fontFamily: fonts.regular }}>הסרה</Text>
                  </View>
                ),
                onPress: () => {
                  handleRemoveRowModalCb(isRecommendation, item, true)
                },
              },
            ]
            return (
              <Fragment key={index}>
                <Swipeout autoClose disabled={!isRecommendation || !isDeleted}
                  right={(isRtl) ? right : left}
                  left={(isRtl) ? left : right}>
                  <RowThirdLevel
                    showAlert={showAlert}
                    deleteParamNav={deleteParamNav}
                    isTransIdRemove={isTransIdRemove}
                    transIdOpened={transIdOpened}
                    isParentOpened={isParentOpened}
                    updateTransactionCb={updateTransactionCb}
                    handleRemoveRowModalCb={handleRemoveRowModalCb}
                    isRecommendation={isRecommendation}
                    isDeleted={isDeleted}
                    loaded={loaded}
                    t={t}
                    account={account}
                    onRefresh={onRefresh}
                    isRtl={isRtl}
                    item={item}
                    accounts={accounts}
                    companyId={companyId}
                  />
                </Swipeout>
                <View style={[styles.dataRowSeparator, { flex: 0 }]} />
              </Fragment>)
          })}
        </View>)
    }
}
