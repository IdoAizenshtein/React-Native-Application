import React, {PureComponent} from 'react'
import {Animated, View} from 'react-native'
import EmptyChart from './EmptyChart'
import Chart from './Chart'
import styles from './ChartStyles'

export default class UncontrolledChartSlider extends PureComponent {
  state = {slideWidth: 1};

  handleSetSlideWidth = (e) => {
    const {width} = e.nativeEvent.layout
    this.setState({slideWidth: width})
  };

  render() {
    const {
      translateX,
      data,
      currentAccount,
      accountsCreditLimit,
      dateTillTimestamp,
      hasNextAccount,
      hasPreviousAccount,
      colorsReverse,
      isLight,
    } = this.props
    const {slideWidth} = this.state
    const creditLimit = currentAccount ? currentAccount.creditLimit : accountsCreditLimit

    return (
        <View
            pointerEvents="none"
            style={styles.chartSliderWrapper}
            onLayout={this.handleSetSlideWidth}
        >
          {hasPreviousAccount && (
              <Animated.View style={{
                position: 'absolute',
                left: -slideWidth,
                transform: [{translateX: translateX}],
              }}>
                <EmptyChart width={slideWidth} dateTillTimestamp={dateTillTimestamp}
                            colorsReverse={colorsReverse}/>
              </Animated.View>
          )}

          <Animated.View style={{width: '100%', transform: [{translateX: translateX}]}}>
            {data && data.data && (
                <Chart data={data} creditLimit={creditLimit} colorsReverse={colorsReverse} isLight={isLight}/>)}
            {(!data || !data.data) && (<EmptyChart
                colorsReverse={colorsReverse}
                showError
                width={slideWidth}
                yMaxValue={6000}
                showRedLine={false}
                dateTillTimestamp={dateTillTimestamp}
            />)}
          </Animated.View>

          {hasNextAccount && (
              <Animated.View style={{
                position: 'absolute',
                right: -slideWidth,
                transform: [{translateX: translateX}],
              }}
              >
                <EmptyChart width={slideWidth} dateTillTimestamp={dateTillTimestamp}
                            colorsReverse={colorsReverse}/>
              </Animated.View>
          )}
        </View>
    )
    }
}
