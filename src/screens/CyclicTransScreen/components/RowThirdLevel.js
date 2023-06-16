import React, { Fragment } from 'react'
import { ActivityIndicator, Animated, Image, Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import { combineStyles as cs, getFormattedValueArray, sp } from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles, { DATA_ROW_HEIGHT } from '../CyclicTransStyles'
import { colors, fonts } from '../../../styles/vars'
import RowFourthLevel from './RowFourthLevel'
import AnimatedControlledRow from '../../../components/DataRow/AnimatedControlledRow'

@withTranslation()
export default class RowThirdLevel extends AnimatedControlledRow {
  static defaultProps = { onUpdateBankTrans: () => null }

  constructor (props) {
    super(props)
    this.initialHeight = DATA_ROW_HEIGHT
    this.maxHeight = this.initialHeight
    this.state = this.initialState
  }

  get initialState () {
    return {
      ...super.initialState,
      closeChild: false,
    }
  }

  getExpandedData () {
    const { inProgress } = this.state
    if (inProgress) {return}
    this.setState({ inProgress: true })
    setTimeout(() => {
      this.setState({ inProgress: false })
    }, 20)
  }

  handleUpdateBankTrans = (newBankTrans) => {
    const { expandedData } = this.state
    const { onUpdateBankTrans } = this.props
    const oldIndex = expandedData.findIndex(t => t.bankTransId === newBankTrans.bankTransId)
    if (oldIndex < 0) {return}
    const newData = [...expandedData]
    newData[oldIndex] = { ...newData[oldIndex], ...newBankTrans }

    onUpdateBankTrans(newBankTrans)
    this.setState({ expandedData: newData, currentEditBankTrans: { ...newBankTrans } })
  }

  handleSelectCategory = (category) => {
    const { currentEditBankTrans } = this.state
    if (!currentEditBankTrans || currentEditBankTrans.transTypeId === category.transTypeId) {return}

    const newBankTrans = {
      ...currentEditBankTrans,
      iconType: category.iconType,
      transTypeId: category.transTypeId,
      transTypeName: category.transTypeName,
    }

    this.setState({ currentEditBankTrans: { ...newBankTrans } })
    return this.handleUpdateBankTrans(newBankTrans)
  }

  handleCloseCategoriesModal = () => {
    this.setState({ categoriesModalIsOpen: false, currentEditBankTrans: null })
  }

  handleOpenCategoriesModal = (bankTransId) => () => {
    this.setState({ categoriesModalIsOpen: true, currentEditBankTrans: bankTransId })
  }

  getTransFrequencyName (name) {
    switch (name) {
      case 'MULTIPLE':
        return 'חודשי'
      case 'MONTH':
        return 'חודשי'
      case 'WEEK':
        return 'שבועי'
      case 'DAY':
        return 'יומי'
      case 'TWO_MONTHS':
        return 'דו חודשי'
      case 'NONE':
        return ''
    }
  }

  getFrequencyDay (name, day) {
    const {
      t,
    } = this.props

    // + t(`weekDay:${day.toLowerCase()}`)
    let dayWeek = ''
    if (day && name === 'WEEK' && typeof (day) === 'number') {
      dayWeek = t(`weekDayNumberShort:${day.toString()}`)
    } else if (day && name === 'WEEK' && typeof (day) === 'string') {
      dayWeek = t(`weekDayShort:${day.toString().toLowerCase()}`)
    }
    switch (name) {
      case 'MULTIPLE':
        return `כל ${day} בחודש `
      case 'MONTH':
        return `כל ${day} בחודש `
      case 'WEEK':
        return 'כל יום ' + dayWeek
      case 'DAY':
        return ''
      case 'TWO_MONTHS':
        return `כל ${day} בחודשיים `
      case 'NONE':
        return ''
    }
  }

  componentDidMount () {
    setTimeout(() => {
      if (this.props.isParentOpened && this.props.transIdOpened && this.props.transIdOpened === this.props.item.transId) {
        this.setState({
          closeChild: false,
        })
        setTimeout(() => {
          this.handleToggle()
          if (this.props.isTransIdRemove) {
            this.props.deleteParamNav()
          } else {
            setTimeout(() => {
              this.props.deleteParamNav()
            }, 800)
          }
        }, 230)
      }
    }, (this.props.isTransIdRemove ? 800 : 500))
  }

  fixRowHeightChild = (heightVal) => {
    const { height } = this.state

    const initialValue = height.__getValue()
    // //console.log(initialValue)

    height.setValue(initialValue)
    Animated.timing(height, { toValue: heightVal, duration: 200, useNativeDriver: false }).start()
  }

  handleToggleRows = () => {
    const { isOpen } = this.state
    this.setState({
      closeChild: !isOpen,
    })
    this.handleToggle()
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { isOpen } = this.state
    if (nextProps.isParentOpened === false && isOpen) {
      this.setState({
        closeChild: true,
      })
      setTimeout(() => {
        this.handleToggle()
      }, 30)
    } else {
      this.setState({
        closeChild: false,
      })
    }
  }

  render () {
    const {
      t,
      account,
      onRefresh,
      isRtl,
      item,
      accounts,
      companyId,
      loaded,
      isRecommendation,
      handleRemoveRowModalCb,
      updateTransactionCb,
      isParentOpened,
      transIdOpened,
      isTransIdRemove,
      deleteParamNav,
      showAlert,
      isDeleted,
    } = this.props
    const { height, isOpen, closeChild, inProgress } = this.state
    const withinRowStyles = cs(isRtl, commonStyles.row, commonStyles.rowReverse)
    const wrapperStyles = cs(isOpen, styles.dataRow, styles.dataRowActive)

    const total = getFormattedValueArray(item.total)
    const numberStyle = cs(item.expence, [styles.dataValue, { color: isDeleted ? '#787878' : colors.green4 }], { color: isDeleted ? '#787878' : colors.red2 })

    return (
      <Fragment>
        <Animated.View style={[styles.dataRowAnimatedWrapper, { height }]}>
          <View style={[wrapperStyles, cs(isRtl, [{ paddingLeft: 50 }], { paddingRight: 50 })]}
            onLayout={this.setMinHeight}>
            <TouchableOpacity onPress={this.handleToggleRows}>
              <View style={[commonStyles.rowReverse, {
                alignSelf: 'center',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
              }]}>
                <View style={[commonStyles.column, {
                  flex: 70,
                }]}>
                  <View style={{
                    flexDirection: 'row-reverse',
                    alignItems: 'center',
                  }}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={[{
                      textAlign: 'right',
                      color: isDeleted ? '#787878' : colors.blue5,
                      fontSize: sp(18),
                    }, cs(isOpen, {
                      fontFamily: fonts.semiBold,
                    }, {
                      fontFamily: fonts.bold,
                    })]}>
                      {item.transName}
                    </Text>

                    {item.solekNickname && (
                      <TouchableOpacity
                        style={{
                          paddingRight: 10,
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={showAlert(item.solekNickname)}
                      >
                        <Image
                          style={[{ width: 16, height: 15.5 }]}
                          source={require('BiziboxUI/assets/iconAler.png')}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View
                    style={withinRowStyles}>
                    <Text style={[{
                      textAlign: 'right',
                      color: isDeleted ? '#787878' : colors.gray6,
                      fontSize: sp(14),
                      fontFamily: fonts.bold,
                    }]}>
                      {this.getTransFrequencyName(item.transFrequencyName)}
                    </Text>
                    <View style={commonStyles.spaceDivider} />
                    <Text style={[{
                      textAlign: 'right',
                      color: isDeleted ? '#787878' : '#b4b4b4',
                      fontSize: sp(14),
                      fontFamily: fonts.regular,
                    }]}>
                      {this.getFrequencyDay(item.transFrequencyName, item.frequencyDay)}
                    </Text>
                  </View>
                </View>
                <View style={{
                  flex: 25,
                }}>
                  <Text
                    style={{
                      flex: 1,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    <Text style={[numberStyle, { fontSize: sp(18) }]}>{total[0]}</Text>
                    <Text style={[styles.fractionalPart, { fontSize: sp(18) }]}>.{total[1]}</Text>
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View onLayout={this.setMaxHeight}>
            {inProgress
              ? <ActivityIndicator color="#999999" style={{ padding: 10 }} />
              : <RowFourthLevel
                deleteParamNav={deleteParamNav}
                transIdOpened={!isTransIdRemove && isParentOpened && transIdOpened && transIdOpened === item.transId}
                isParentOpened={isParentOpened}
                closeChild={closeChild}
                updateTransactionCb={updateTransactionCb}
                handleRemoveRowModalCb={handleRemoveRowModalCb}
                loaded={loaded}
                onFixRowHeight={this.fixRowHeightChild}
                t={t}
                companyId={companyId}
                onRefresh={onRefresh}
                accounts={accounts}
                account={account}
                isRtl={isRtl}
                item={item}
                isDeleted={isDeleted}
                isRecommendation={isRecommendation}
              />}
          </View>
        </Animated.View>
      </Fragment>
    )
  }
}
