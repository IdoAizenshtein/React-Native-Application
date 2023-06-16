import React, { Fragment, PureComponent } from 'react'
import { Animated, Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import CustomIcon from 'src/components/Icons/Fontello'
import commonStyles from 'src/styles/styles'
import { combineStyles as cs, sp } from 'src/utils/func'
import styles from './CreditCardHeaderStyles'
import { colors, fonts } from 'src/styles/vars'
import { HEADER_ALERT_BORDER_HEIGHT, HEADER_STICKY_BLOCK_HEIGHT } from '../../BankAccountsScreen/BankAccountsStyles'

@withTranslation()
export default class CreditCardHeader extends PureComponent {
  get cardTitle () {
    const { cards, selectedCards, t, isRtl, onOpenCardsModal } = this.props

    const wrapperStyle = cs(isRtl, [
      commonStyles.row,
      commonStyles.alignItemsCenter, {
        elevation: 5,
        zIndex: 10,
      }], commonStyles.rowReverse)

    if (!selectedCards.length) {
      return (
        <TouchableOpacity
          style={wrapperStyle}
          onPress={onOpenCardsModal}
        >
          <CustomIcon name="credit" size={22} color={colors.blue15} />
        </TouchableOpacity>
      )
    }

    const card = selectedCards[0]

    if (selectedCards.length === 1) {
      return (
        <TouchableOpacity
          style={wrapperStyle}
          onPress={onOpenCardsModal}
        >
          <CustomIcon name="credit" size={16} color={colors.blue15} />
          <View style={commonStyles.spaceDividerDouble} />
          <Text style={styles.cardTitleText}>{card.creditCardNickname}</Text>
        </TouchableOpacity>
      )
    }

    const title = cards.length === selectedCards.length
      ? t('creditCards:allSelectedCards')
      : t('creditCards:multipleSelected')

    return (
      <TouchableOpacity
        style={wrapperStyle}
        onPress={onOpenCardsModal}
      >
        <CustomIcon name="credit" size={16} color={colors.blue15} />
        <View style={commonStyles.spaceDividerDouble} />
        <Text style={styles.cardTitleText}>{title}</Text>
      </TouchableOpacity>
    )
  }

  get selectedCards () {
    const { selectedCards } = this.props
    if (selectedCards.length > 1) {return [null, ...selectedCards]}
    return selectedCards
  }

  render () {
    const {
      t,
      hasAlert,
      scrollY,
      headerScrollDistance,
      onSetHeaderHeight,
    } = this.props

    const headerWrapperTranslate = scrollY.interpolate({
      inputRange: [0, headerScrollDistance],
      outputRange: [0, -headerScrollDistance + 35],
      extrapolate: 'clamp',
    })

    const yFixed = 45

    const firstImgOpacity = scrollY.interpolate({
      inputRange: [0, (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0, headerScrollDistance, headerScrollDistance],
      outputRange: [0, 0, headerScrollDistance - yFixed, 0],
      extrapolate: 'clamp',
    })

    const opacity = scrollY.interpolate({
      inputRange: [0, 272 - 1, 272],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    })

    return (
      <View
        style={[styles.cardTitleWrapper]}
        pointerEvents="box-none"
        onLayout={onSetHeaderHeight}
      >
        <Animated.View
          style={[{ transform: [{ translateY: headerWrapperTranslate }] }]}
          pointerEvents="box-none"
        >
          <View style={{
            position: 'relative',
            backgroundColor: colors.white,
          }}>
            <Text style={[{
              textAlign: 'center',
              fontSize: sp(24),
              paddingTop: 5,
              color: colors.blue15,
              fontFamily: fonts.semiBold,
            }]}>{t('mainMenu:creditCard')}</Text>

            <Animated.View style={{ elevation: 6, zIndex: 6 }}>

              <Animated.View style={[{
                position: 'absolute',
                height: HEADER_STICKY_BLOCK_HEIGHT,
                width: '100%',
                shadowColor: 'black',
                shadowOpacity: 0.1,
                backgroundColor: colors.white,
                shadowRadius: 0.5,
                shadowOffset: { width: 0, height: 2 },
                elevation: 4,
                zIndex: 2,
              }, { opacity: firstImgOpacity }]} />

              <View style={[{
                paddingHorizontal: 20,
                flexDirection: 'row',
                justifyContent: 'center',
                marginBottom: 0,
                backgroundColor: colors.white,
                height: HEADER_STICKY_BLOCK_HEIGHT,
                elevation: 6,
                zIndex: 99,
              }]}>

                {this.cardTitle}

              </View>
            </Animated.View>

            {hasAlert && (
              <Fragment>
                <Animated.View
                  style={[{
                    flex: 1,
                    height: HEADER_ALERT_BORDER_HEIGHT,
                    backgroundColor: colors.red2,
                    zIndex: 4,
                    transform: [{ translateY: 0 }],
                    opacity: opacity,
                  }]} />
              </Fragment>
            )}
          </View>
        </Animated.View>
      </View>
    )
  }
}
