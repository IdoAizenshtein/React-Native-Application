import React, {Fragment} from 'react'
import {Animated, Text, TouchableOpacity, View} from 'react-native'
import CustomIcon from 'src/components/Icons/Fontello'
import {combineStyles as cs, getCurrencyChar, getFormattedValueArray, sp} from 'src/utils/func'
import commonStyles from 'src/styles/styles'
import styles, {DATA_ROW_HEIGHT} from '../CreditCardsStyles'
import {colors, fonts} from 'src/styles/vars'
import AnimatedRow from 'src/components/DataRow/AnimatedRow'
import CreditCardAdditionalInfo from './CreditCardAdditionalInfo'
import {CURRENCIES} from 'src/constants/common'
import {dateToFromNowDaily} from '../../../utils/date'

export default class CreditCardDetailsRow extends AnimatedRow {
  constructor (props) {
    super(props)

    this.initialHeight = DATA_ROW_HEIGHT
    this.maxHeight = this.initialHeight
    this.state = this.initialState
  }

  get initialState () {
    return {
      ...super.initialState,
      isEditing: false,
      mainDesc: this.props.data.mainDescription,
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { parentIsOpen } = nextProps
    if (!parentIsOpen && this.state.isOpen) {this.handleToggle()}
  }

    handleStartEditing = () => this.setState({ isEditing: true });

    handleChangeMainDesc = (mainDesc) => this.setState({ mainDesc });

    handleCancelChangeMainDesc = () => {
      this.setState({
        mainDesc: this.props.data.mainDescription,
        isEditing: false,
      })
    };

    handleUpdate = (data) => {
      const { onUpdateCardTrans } = this.props
      onUpdateCardTrans(data)
    };

    handleToggle () {
      super.handleToggle()
      if (this.state.isEditing) {this.handleCancelChangeMainDesc()}
    }

    render () {
      const { data, isRtl, account, cycleDate, onEditCategory, t, companyId } = this.props
      const { height, isOpen, isEditing } = this.state

      const wrapperStyles = cs(isOpen, styles.dataRow, styles.dataRowActive)

      const total = getFormattedValueArray(data.transTotal)
      const isILS = data && data.iskaCurrency && data.iskaCurrency.toString().toLowerCase() === CURRENCIES.ILS
      const numberStyle = cs(data.transTotal < 0, [styles.dataValue, { color: colors.blue8 }], { color: colors.green4 })
      const withinRowStyles = cs(isRtl, commonStyles.row, commonStyles.rowReverse)

      return (
        <Animated.View style={[styles.dataRowAnimatedWrapper, { height }]}>
          <TouchableOpacity onPress={this.handleToggle}>

            <View style={wrapperStyles} onLayout={this.setMinHeight}>
              <View style={[withinRowStyles, {
                alignSelf: 'center',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
              }]}>
                <Text
                  style={[styles.dataDescInput, {
                    textAlign: 'right',
                    color: colors.blue8,
                    fontSize: sp(18),
                    flex: 70,
                  }, cs(isOpen, {
                    fontFamily: fonts.semiBold,
                  }, {
                    fontFamily: fonts.bold,
                  })]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {data.mainDescription}
                </Text>
                <View style={{
                  flexDirection: 'row-reverse',
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  alignContent: 'center',
                  justifyContent: 'center',
                }}>
                  {data.transTotal < 0 ? (
                    <Fragment>
                      <CustomIcon
                        name="shekel-negative"
                        size={18}
                        color={colors.blue5}
                      />
                      <View style={commonStyles.spaceDividerDouble} />
                    </Fragment>
                  ) : null}
                  {!isILS && (
                    <Fragment>
                      <CustomIcon name="globe" size={17} color={colors.blue8} />
                      <View style={commonStyles.spaceDividerDouble} />
                    </Fragment>
                  )}
                  <Text
                    style={{
                      alignSelf: 'flex-end',

                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {!isILS &&
                      <Text style={styles.dataValueText}>{getCurrencyChar(data.iskaCurrency)}</Text>}
                    <Text style={[numberStyle, { fontSize: sp(18) }, cs(isOpen, {
                      fontFamily: fonts.semiBold,
                    }, {
                      fontFamily: fonts.bold,
                    })]}>{total[0]}</Text>
                    <Text style={[styles.fractionalPart, { fontSize: sp(18) }]}>.{total[1]}</Text>
                  </Text>
                </View>
              </View>
              <View style={[withinRowStyles, {}]}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={{
                  fontSize: sp(14),
                  fontFamily: fonts.light,
                  color: colors.gray6,
                }}>
                  {dateToFromNowDaily(data.transDate, t, 'DD/MM')} {data.cyclic ? '(הרשאה לחיוב)' : ''}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View onLayout={this.setMaxHeight}>
            <CreditCardAdditionalInfo
              companyId={companyId}
              t={t}
              onEdit={this.handleUpdate}
              isRtl={isRtl}
              data={data}
              account={account}
              cycleDate={cycleDate}
              onEditCategory={onEditCategory}
              isMainDescEditing={isEditing}
              onStartEdit={this.handleStartEditing}
              onSubmitEdit={this.handleUpdate}
            />
          </View>

          <View style={[styles.dataRowSeparator, { flex: 0 }]} />
        </Animated.View>
      )
    }
}
