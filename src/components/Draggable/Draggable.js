import React, { PureComponent } from 'react'
import { Animated, PanResponder } from 'react-native'

export default class Draggable extends PureComponent {
  constructor (props) {
    super(props)

    this.state = { pan: new Animated.ValueXY() }

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderMove: Animated.event([
        null,
        {
          dx: this.state.pan.x,
          dy: this.state.pan.y,
        },
      ]),
      onPanResponderRelease: (e, gesture) => {
        Animated.spring(this.state.pan, {
          toValue: {
            x: 0,
            y: 0,
          },
          friction: 10,
          useNativeDriver: true,
        }).start()
      },
    })
  }

  render () {
    const { children, style } = this.props
    const panStyle = {
      transform: this.state.pan.getTranslateTransform(),
    }
    return (
      <Animated.View
        {...this.panResponder.panHandlers}
        style={[panStyle, style]}
      >
        {children}
      </Animated.View>
    )
  }
}
