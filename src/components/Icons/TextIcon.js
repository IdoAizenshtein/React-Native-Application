import React, {PureComponent} from 'react'
import {Animated, Text, View} from 'react-native'
import CustomIcon from '../../components/Icons/Fontello'
import {combineStyles as cs} from '../../utils/func'
import commonStyles from '../../styles/styles'
import {colors} from '../../styles/vars'
import * as Animatable from 'react-native-animatable'

const AnimatableIcon = Animatable.createAnimatableComponent(CustomIcon)

export default class TextIcon extends PureComponent {
    static defaultProps = {
      isRtl: false,
      iconColor: colors.blue7,
      iconSize: 14,
    };

    render () {
      const { isRtl, text, wrapperStyle, textStyle, iconName, iconSize, iconColor, isAnimate } = this.props
      if (!isAnimate) {
        return (
          <View
            style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter, wrapperStyle], commonStyles.rowReverse)}>
            <CustomIcon name={iconName} size={iconSize} color={iconColor} />
            <View style={commonStyles.spaceDivider} />
            <Text style={textStyle}>{text}</Text>
          </View>
        )
      } else {
        return (
          <Animated.View
            style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter, wrapperStyle], commonStyles.rowReverse)}>
            <AnimatableIcon name={iconName} size={iconSize} style={iconColor} />
            <View style={commonStyles.spaceDivider} />
            <Animated.Text style={textStyle}>{text}</Animated.Text>
          </Animated.View>
        )
      }
    }
}
