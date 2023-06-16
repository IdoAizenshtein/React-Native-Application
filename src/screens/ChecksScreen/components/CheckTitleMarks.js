import React, { PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import { Animated, Text, View } from 'react-native'
import { fonts } from '../../../styles/vars'
import { IS_IOS } from '../../../constants/common'
import { combineStyles as cs, sp } from '../../../utils/func'

@withTranslation()
export default class CheckTitleMarks extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      width: new Animated.Value((IS_IOS) ? 0 : 0.0001),
    }
  }

  componentDidMount () {
    this.animateTo(this.props.delay, this.props.value)
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.value !== this.props.value) {
      this.animateTo(nextProps.delay, nextProps.value)
    }
  }

  animateTo = (delay, value) => {
    Animated.timing(
      this.state.width,
      {
        toValue: value,
        duration: delay,
        useNativeDriver: true,
      },
    ).start()
  }

  render () {
    let { width } = this.state
    let { text, scaleX } = this.props
    const barStyles = {
      backgroundColor: '#08d3b8',
      height: 33,
      width: width,
      borderTopRightRadius: 16.5,
      borderBottomRightRadius: 16.5,
    }
    return (
      <View>
        <Text style={[
          {
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0,
            top: 0,
            zIndex: 2,
            fontFamily: this.props.value === 0 ? fonts.regular : fonts.semiBold,
            textAlign: 'center',
            width: '100%',
            color: this.props.value === 0 ? '#022258' : '#ffffff',
            fontSize: sp(24),
          }, cs(scaleX, [{}], { transform: [{ scaleX: -1 }] })]}
        >{text}</Text>
        <Animated.View style={barStyles}/>
      </View>
    )
  }
}
