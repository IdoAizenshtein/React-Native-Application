import React, { Fragment, PureComponent } from 'react'
import { Animated, Easing, View } from 'react-native'
import { CardMatch } from './CardMatch'
import { IS_IOS } from '../../../constants/common'
import Carousel from 'react-native-snap-carousel'
import { colors } from '../../../styles/vars'
import Loader from '../../../components/Loader/Loader'

export class CarouselComponent extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      inProgress: false,
      isShake: false,
      animatedValue: new Animated.Value(0),
    }
  }

  animate = () => {
    if (this.state.isShake) {
      this.state.animatedValue.setValue(0)
        Animated.timing(
          this.state.animatedValue,
          {
            toValue: 1,
            duration: 1000,
            easing: Easing.easeInEaseOut,
            useNativeDriver: true,
          },
        ).start(() => this.animate())
      }
    };

    UNSAFE_componentWillReceiveProps (nextProps) {
      if (nextProps.data !== this.props.data) {
        this.setState({
          inProgress: true,
        })
        setTimeout(() => {
          this.setState({
            inProgress: false,
          })
        }, 20)
      }
      if (nextProps.isShake !== this.props.isShake) {
        this.setState({
          isShake: nextProps.isShake,
        })
      }
    }

    _renderItem = ({ item, index }) => {
      const {
        isRtl,
        t,
        removeFromMatches,
        handleIsShake,
      } = this.props
      const { isShake } = this.state
      return (
        <CardMatch
          shakeAll={handleIsShake}
          isShake={isShake}
          removeFromMatches={removeFromMatches}
          isRtl={isRtl}
          t={t}
          banktransForMatchData
          item={item}
        />
      )
    };

    _renderItemCash = ({ item, index }) => {
      const {
        isRtl,
        t,
        removeFromMatches,
        handleIsShake,
      } = this.props
      const { isShake } = this.state
      return (
        <CardMatch
          shakeAll={handleIsShake}
          isShake={isShake}
          removeFromMatches={removeFromMatches}
          isRtl={isRtl}
          t={t}
          banktransForMatchData={false}
          item={item}
        />
      )
    };

    render () {
      const { banktransForMatchData, data } = this.props
      const { inProgress } = this.state
      return (
        <View>
          {inProgress ? (
            <Loader
              isDefault
              containerStyle={{ backgroundColor: 'transparent' }}
              size="small"
              color={colors.blue}
            />
          ) : (
            <Fragment>
              <Carousel
                removeClippedSubviews
                extraData={this.state}
                loop
                layout={'stack'}
                layoutCardOffset={9}
                ref={(c) => {
                  this._carousel = c
                }}
                data={data}
                renderItem={(banktransForMatchData) ? this._renderItem : this._renderItemCash}
                sliderWidth={IS_IOS ? 199 : 199}
                itemWidth={IS_IOS ? 176 : 188}
                itemHeight={IS_IOS ? 74 : 86}
                sliderHeight={100}
              />
            </Fragment>
          )}
        </View>
      )
    }
}
