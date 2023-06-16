import React, { PureComponent } from 'react'
import { Animated, PanResponder } from 'react-native'

export default class UncontrolledDragAndSwipeArea extends PureComponent {
  constructor (props) {
    super(props)

    const { animate, onMove } = props

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleShouldSetPanResponder,
      onMoveShouldSetPanResponder: this.handleShouldSetPanResponder,
      onPanResponderMove: Animated.event(
        [
          null,
          {
            dx: animate.x,
            dy: animate.y,
          }],
        { listener: onMove },
      ),
      onPanResponderRelease: () => {
        if (!this.isPanResponderCanMove) {return}
        Animated.spring(animate, {
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

  get isPanResponderCanMove () {
    return this.props.isHeaderChartSliderPanEnable
  }

    handleShouldSetPanResponder = (e, gestureState) => {
      return e.nativeEvent.touches.length === 1 && !this.gestureIsPress(gestureState)
    };

    gestureIsPress = (gestureState) => {
      return Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5
    };

    render () {
      const { headerMaxHeight, headerMinHeight } = this.props
      const panHandlers = this.isPanResponderCanMove ? this.panResponder.panHandlers : {}

      return <Animated.View
        {...panHandlers}
        style={{
          flex: 1,
          height: headerMaxHeight - headerMinHeight,
          backgroundColor: 'white',
        }}
      />
    }
}
