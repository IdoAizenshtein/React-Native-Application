import React, {Fragment, PureComponent} from 'react'
import Svg, {Path} from 'react-native-svg'
import AppTimezone from '../../utils/appTimezone'
import {range} from 'lodash'
import {withTranslation} from 'react-i18next'
import {Text, View} from 'react-native'
import styles, {X_AXIS_HEIGHT, Y_AXIS_WIDTH} from './ChartStyles'
import {colors} from 'src/styles/vars'
import {getListOfDatesInterval} from 'src/utils/date'
import {DEFAULT_DATE_FORMAT} from 'src/constants/common'
import {combineStyles as cs, formatNumberToUnits} from 'src/utils/func'

@withTranslation()
export default class EmptyChart extends PureComponent {
    static defaultProps = {
        yMaxValue: 6000,
        showRedLine: true,
        showError: false,
    };

    constructor(props) {
        super(props)

        const {dateTillTimestamp, yMaxValue} = props

        this.state = {
            height: 1,
            gridStep: 40,
            gridOffset: 30,
            yAxis: this.getYAxisLabels(0, yMaxValue),
            xAxis: getListOfDatesInterval(
                AppTimezone.moment(dateTillTimestamp).subtract(2, 'day'),
                AppTimezone.moment(dateTillTimestamp),
                'days',
                DEFAULT_DATE_FORMAT,
            ),
        }
    }

    get width() {
        const width = this.props.width - Y_AXIS_WIDTH
        return width > 0 ? width : 1
    }

    get grid() {
        const {height, gridStep, gridOffset} = this.state
        const {colorsReverse} = this.props

        const vertical = range(Math.ceil((this.width + gridOffset) / gridStep)).map(i => {
            if (!i) {return null}
            const x = i * gridStep - gridOffset
            const path = `M ${x},${0} L ${x},${height}`

            return (
                <Path
                    key={path}
                    d={path}
                    stroke={(!colorsReverse) ? colors.white : colors.blue32}
                    strokeWidth="0.5"
                    fill="none"
                    opacity="0.05"
                />
            )
        })

        const horizontal = range(Math.ceil((height + gridOffset) / gridStep)).map(i => {
            if (!i) {return null}
            const y = i * gridStep - gridOffset
            const path = `M ${0},${y} L ${this.width},${y}`

            return (
                <Path
                    key={path}
                    d={path}
                    stroke={(!colorsReverse) ? colors.white : colors.blue32}
                    strokeWidth="0.5"
                    fill="none"
                    opacity="0.1"
                />
            )
        })

        return <Fragment>{vertical}{horizontal}</Fragment>
    }

    getYAxisLabels = (minValue, maxValue) => {
        const yAxisLabelCount = 4

        const yMultiplier = (maxValue - minValue) / (yAxisLabelCount - 1)
        return range(yAxisLabelCount)
            .map((num, i) => formatNumberToUnits(i * yMultiplier + minValue))
            .map((label, i, arr) => {
                return label === arr[i + 1] ? formatNumberToUnits(i * yMultiplier + minValue, 2) : label
            })
            .reverse()
    };

    handleSetLayoutSize = e => {
        const {height} = e.nativeEvent.layout
        this.setState({height: height - X_AXIS_HEIGHT}, this.setData)
    };

    render() {
        const {showRedLine, showError, t, colorsReverse} = this.props
        const {height, yAxis, xAxis} = this.state

        return (
            <View
                style={[styles.chartWrapper, {
                    backgroundColor: colorsReverse ? colors.white : colors.blue32,
                }]}
                onLayout={this.handleSetLayoutSize}
                pointerEvents="none"
            >
                <View style={styles.chartYAxisWrapper}>
                    {yAxis.map(val => (
                        <Text
                            key={val}
                            style={[styles.chartYAxisText, {
                                color: colorsReverse ? colors.blue32 : colors.white,
                            }]}
                            numberOfLines={1}
                        >
                            {val}
                        </Text>
                    ))}
                </View>

                <View style={styles.chartRightWrapper}>

                    <Svg height={height} width={this.width}>
                        {/* <Defs> */}
                        {/* <LinearGradient id='bgGrad' x1='0' x2='0' y1='0' y2='100%'> */}
                        {/* <stop offset='0%' stopColor='#43749d' stopOpacity='0.25' /> */}
                        {/* <stop offset='100%' stopColor={colorsReverse ? colors.blue32 : colors.white} stopOpacity='0' /> */}
                        {/* </LinearGradient> */}
                        {/* </Defs> */}

                        {this.grid}
                    </Svg>

                    {showError && (
                        <View style={styles.errorWrapper}>
                            <View
                                style={[styles.errorDivider, {backgroundColor: colorsReverse ? colors.blue32 : colors.white}]}/>
                            <Text
                                style={[styles.errorText, {color: colorsReverse ? colors.blue32 : colors.white}]}>{t('bankAccount:noBalanceInformationFound')}</Text>
                            <View
                                style={[styles.errorDivider, {backgroundColor: colorsReverse ? colors.blue32 : colors.white}]}/>
                        </View>
                    )}

                    <View style={cs(!showRedLine, styles.chartXAxis, {borderTopColor: 'transparent'})}>
                        {xAxis.map((x) => (
                            <Text
                                key={x}
                                style={[styles.chartXAxisText, {color: colorsReverse ? colors.blue32 : colors.white}]}
                            >
                                {x}
                            </Text>
                        ))}
                    </View>
                </View>
            </View>
        )
    }
}
