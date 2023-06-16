import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Keyboard, Text, TouchableOpacity, View } from 'react-native'
import Icon from '../../components/Icons/Fontello'
import styles from './HeaderStyles'
import { colors, fonts } from '../../styles/vars'
import { goTo, goToBack, sp } from '../../utils/func'

@connect(state => ({
  isRtl: state.isRtl,
  messagesCount: state.messagesCount,
  openedBottomSheet: state.openedBottomSheet,
}))
export default class HeaderControlsFactory extends PureComponent {
  get left () {
    const { openedBottomSheet } = this.props
    return (
      <View style={{
        opacity: openedBottomSheet ? 0.8 : 1,
      }}>
        {!this.props.isModal && (
          <TouchableOpacity
            style={styles.btnWrapper}
            hitSlop={{
              top: 20,
              bottom: 20,
              left: 20,
              right: 20,
            }}
            onPress={this.handleOpenMenu}
          >
            <Icon name="menu" size={18} color={colors.blue4}/>
          </TouchableOpacity>)}
        {this.props.isModal && (
          <TouchableOpacity
            style={styles.btnWrapper}
            hitSlop={{
              top: 20,
              bottom: 20,
              left: 20,
              right: 20,
            }}
            onPress={this.goToLocation}>
            <Text style={{
              fontSize: sp(16),
              color: '#ffffff',
              fontFamily: fonts.semiBold,
            }}>{'ביטול'}</Text>
            {/* <Icon name='times' size={13.5} color={colors.white} /> */}
          </TouchableOpacity>
        )}
      </View>
    )
  }

  get right () {
    const { messagesCount, openedBottomSheet } = this.props
    return (
      <TouchableOpacity
        hitSlop={{
          top: 20,
          bottom: 5,
          left: 20,
          right: 20,
        }}
        onPress={this.goToMessages}
        style={[
          styles.btnWrapper, {
            opacity: openedBottomSheet ? 0.8 : 1,
          }]}
      >
        <View style={styles.messagesCountContainer}>
          <Icon name="bell" size={22} color={colors.blue4}/>

          {messagesCount ? (
            <View style={[styles.messagesCountWrapper, {
              opacity: openedBottomSheet ? 0.8 : 1,
            }]}>
              <Text style={styles.messagesCount}>{messagesCount > 99 ? '99+' : messagesCount}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    )
  }

    goToLocation = () => {
      Keyboard.dismiss()
      goToBack(this.props.navigation)
    };

    goToMessages = () => {
      Keyboard.dismiss()
      const routeName = this.props.route.name
      if (routeName === 'MESSAGES') {
        goToBack(this.props.navigation)
      } else {
        goTo(this.props.navigation, 'MESSAGES')
      }
    };

    handleOpenMenu = () => {
      Keyboard.dismiss()
      this.props.navigation.openDrawer()
    };

    render () {
      const { isRtl, position } = this.props

      if (isRtl) {
        if (position === 'left') {return this.right}
        if (position === 'right') {return this.left}
      }

      if (position === 'left') {return this.left}
      if (position === 'right') {return this.right}
    }
}
