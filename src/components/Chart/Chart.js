import React, {Fragment, PureComponent} from 'react'
import Svg, {Circle, Defs, LinearGradient, Path, RadialGradient, Stop} from 'react-native-svg'
import {isEmpty, last, range, replace} from 'lodash'
import AppTimezone from '../../utils/appTimezone'
import {withTranslation} from 'react-i18next'
import {Text, View} from 'react-native'
import {combineStyles as cs, formatNumberToUnits} from 'src/utils/func'
import commonStyles from 'src/styles/styles'
import {colors} from 'src/styles/vars'
import styles, {X_AXIS_HEIGHT, Y_AXIS_WIDTH} from './ChartStyles'
import {bezierCommandCalc, getGraphPath} from './chartLib'

const numberFormat = new Intl.NumberFormat('he')

@withTranslation()
export default class Chart extends PureComponent {
    constructor(props) {
        super(props)

        const {data, maxChartValue, minChartValue, logarithmScale} = this.props.data

        this.state = {
            smoothing: 0.2,
            width: 1,
            height: 1,
            gridStep: 40,
            gridOffset: 30,
            paddingTop: 10,
            paddingBottom: 15,
            paddingLeft: 7,
            paddingRight: 5,
            yAxis: [],
            xAxis: [],
            existingDataPoints: [],
            futureDataPoints: [],
            isToday: false,
        }

        const isToday = AppTimezone.moment().diff(last(data).date, 'days')
        this.state.isToday = isToday === 0

        const hasFuturePoint = data.some(d => !d.bankTrans)
        this.state.paddingRight = (this.state.isToday || hasFuturePoint) && !props.colorsReverse ? 63 : 5

        this.state.yAxis = this.getYAxisLabels(data, minChartValue, maxChartValue, logarithmScale)
        this.state.xAxis = data.length === 1
            ? [this.state.isToday ? props.t('calendar:today') : data[0].dateDesc]
            : data.length === 2
                ? [
                    data[0].dateDesc,
                    this.state.isToday ? props.t('calendar:today') : last(data).dateDesc,
                ]
                : [
                    data[0].dateDesc,
                    data[Math.floor(data.length / 2)].dateDesc,
                    this.state.isToday ? props.t('calendar:today') : last(data).dateDesc,
                ]
    }

    get daysCount() {
        const {data} = this.props
        if (!data) {return 0}
        return data.data.length
    }

    get isShowCreditLimit() {
        const {data, creditLimit} = this.props
        return creditLimit > data.minChartValue
    }

    get isOneDayLength() {
        return this.daysCount === 1
    }

    get isTwoDaysLength() {
        return this.daysCount === 2
    }

    get xAxisStep() {
        const {paddingLeft, paddingRight, width} = this.state
        if (this.isOneDayLength) {return width / 2}
        return (width - (paddingLeft + paddingRight)) / (this.daysCount - 1)
    }

    get hasPoints() {
        const {existingDataPoints, futureDataPoints} = this.state
        return !isEmpty(existingDataPoints) || !isEmpty(futureDataPoints)
    }

    get grid() {
        const {colorsReverse} = this.props
        const {height, width, gridStep, gridOffset} = this.state
        const vertical = range(Math.ceil((width + gridOffset) / gridStep)).map(i => {
            if (!i) {return null}
            const x = i * gridStep - gridOffset
            const path = `M ${x},${0} L ${x},${height}`

            return (
                <Path
                    key={path}
                    d={path}
                    stroke={colorsReverse ? colors.blue32 : colors.white}
                    strokeWidth="0.5"
                    fill="none"
                    opacity="0.05"
                />
            )
        })

        const horizontal = range(Math.ceil((height + gridOffset) / gridStep)).map(i => {
            if (!i) {return null}
            const y = i * gridStep - gridOffset
            const path = `M ${0},${y} L ${width},${y}`

            return (
                <Path
                    key={path}
                    d={path}
                    stroke={colorsReverse ? colors.blue32 : colors.white}
                    strokeWidth="0.5"
                    fill="none"
                    opacity="0.1"
                />
            )
        })

        return <Fragment>{vertical}{horizontal}</Fragment>
    }

    get futureDataPointsForView() {
        const {existingDataPoints, futureDataPoints} = this.state

        if (existingDataPoints.length) {return [last(existingDataPoints), ...futureDataPoints]}
        return futureDataPoints
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            const {data, maxChartValue, minChartValue, logarithmScale} = nextProps.data
            const hasFuturePoint = data.some(d => !d.bankTrans)
            const isToday = AppTimezone.moment().diff(last(data).date, 'days') === 0
            this.setState({
                smoothing: 0.2,
                gridStep: 40,
                gridOffset: 30,
                paddingTop: 10,
                paddingBottom: 15,
                paddingLeft: 7,
                paddingRight: (isToday || hasFuturePoint) && !nextProps.colorsReverse ? 63 : 5,
                yAxis: this.getYAxisLabels(data, minChartValue, maxChartValue, logarithmScale),
                xAxis: data.length === 1
                    ? [isToday ? nextProps.t('calendar:today') : data[0].dateDesc]
                    : data.length === 2
                        ? [
                            data[0].dateDesc,
                            isToday ? nextProps.t('calendar:today') : last(data).dateDesc,
                        ]
                        : [
                            data[0].dateDesc,
                            data[Math.floor(data.length / 2)].dateDesc,
                            isToday ? nextProps.t('calendar:today') : last(data).dateDesc,
                        ],
                existingDataPoints: [],
                futureDataPoints: [],
                isToday: isToday,
            })
            this.setData()
        }
    }

    getYAxisLabels = (data, minValue, maxValue, logBase) => {
        const yAxisLabelCount = 4

        if (logBase) {
            const logMax = this.getBaseLog(maxValue)
            const logMin = this.getBaseLog(minValue)
            const logStep = (logMax - logMin) / 3

            const firstMidValue = logMin + logStep
            const secondMidValue = logMin + logStep * 2

            const getMidLabel = (val) => {
                return val < 0
                    ? -(Math.pow(logBase, Math.abs(val)))
                    : Math.pow(logBase, val)
            }

            return [maxValue, isFinite(getMidLabel(secondMidValue)) ? getMidLabel(secondMidValue) : secondMidValue, isFinite(getMidLabel(firstMidValue)) ? getMidLabel(firstMidValue) : firstMidValue, minValue]
                .map(n => formatNumberToUnits(n))
        }

        const yMultiplier = (maxValue - minValue) / (yAxisLabelCount - 1)
        return range(yAxisLabelCount)
            .map((num, i) => formatNumberToUnits(i * yMultiplier + minValue))
            .map((label, i, arr) => {
                return label === arr[i + 1] ? formatNumberToUnits(i * yMultiplier + minValue, 2) : label
            })
            .reverse()
    };

    getBaseLog = (value, base) => {
        base = base || this.props.data.logarithmScale

        if (!base) {return value}
        if (value === 0) {return 0}
        if (value < 0) {return -(Math.floor(this.logp(Math.abs(value), base)))}
        return Math.floor(this.logp(value, base))
    };

    logp = (value, base) => {
        switch (base) {
            case Math.E:
                return Math.log(value)
            case 2:
                return Math.log2(value)
            case 10:
                return Math.log10(value)
            default:
                return Math.log(value) / Math.log(base)
        }
    };

    getYPercent = (value) => {
        const {maxChartValue, minChartValue, logarithmScale} = this.props.data
        // console.log(maxChartValue)
        const yInterval = Math.abs(this.getBaseLog(maxChartValue) - this.getBaseLog(minChartValue)) || 1

        return value === 0
            ? 100 - Math.floor(this.getBaseLog(Math.abs(minChartValue), logarithmScale) / yInterval * 100)
            : Math.floor((this.getBaseLog(maxChartValue) - value) / yInterval * 100)
    };

    getYCoord = (percent = 0) => {
        const {paddingTop, height, paddingBottom} = this.state
        return percent === 0
            ? paddingTop
            : ((height - (paddingTop + paddingBottom)) / 100 * percent) + paddingTop
    };

    setData = () => {
        const {data} = this.props.data
        const xAxisStep = this.xAxisStep

        const computedData = data.reduce((memo, item, i) => {
            const {paddingLeft} = this.state
            const x = this.isOneDayLength
                ? xAxisStep
                : i * xAxisStep + paddingLeft

            const percent = this.getYPercent(this.getBaseLog(item.value))

            if (item.bankTrans) {
                memo.existingDataPoints.push([x, this.getYCoord(percent)])
            } else {
                memo.futureDataPoints.push([x, this.getYCoord(percent)])
            }

            return memo
        }, {existingDataPoints: [], futureDataPoints: []})

        this.setState({...computedData})
    };

    getFillPath = (path) => {
        const {height, existingDataPoints, futureDataPoints, paddingLeft} = this.state
        if (!this.hasPoints) {return ''}
        const lastPoint = futureDataPoints.length ? last(futureDataPoints) : last(existingDataPoints)
        const newPath = replace(path, 'M', 'L')
        return `M ${paddingLeft},${height} ${newPath} L ${lastPoint[0]},${height} L ${paddingLeft},${height}`
    };

    getBorderPath = () => {
        const {height, existingDataPoints} = this.state
        if (!existingDataPoints || !existingDataPoints.length) {return ''}
        const lastPoint = last(existingDataPoints)
        return `M ${lastPoint[0]},${lastPoint[1]} L ${lastPoint[0]},${height}`
    };

    getCreditLimitPath = () => {
        const {width} = this.state
        const {creditLimit} = this.props
        const percent = this.getYPercent(this.getBaseLog(creditLimit))
        const y = this.getYCoord(percent)

        return `M ${0},${y} L ${width},${y}`
    };

    handleSetLayoutSize = e => {
        const {height, width} = e.nativeEvent.layout
        this.setState({height: height - X_AXIS_HEIGHT, width: width - Y_AXIS_WIDTH}, this.setData)
    };

    render() {
        const {
            height,
            width,
            existingDataPoints,
            futureDataPoints,
            yAxis,
            xAxis,
            paddingRight,
            isToday,
            smoothing,
        } = this.state
        const {creditLimit, colorsReverse, isLight} = this.props

        const path = getGraphPath(existingDataPoints, bezierCommandCalc, smoothing)
        const futurePath = getGraphPath(this.futureDataPointsForView, bezierCommandCalc, smoothing)
        const fullPath = `${path} ${futurePath}`
        const fillPath = this.getFillPath(fullPath)
        const lastPoint = last(existingDataPoints)
        const isShowCreditLimit = this.isShowCreditLimit
        const hasEndBorder = !!(isToday || futureDataPoints.length)
        const hasEndPoint = !!(hasEndBorder || this.isOneDayLength)
        const xAxisStyles = cs(
            this.isOneDayLength,
            cs(
                isShowCreditLimit,
                [styles.chartXAxis, {paddingRight: paddingRight - 20}],
                {borderTopColor: 'transparent'},
            ),
            commonStyles.justifyCenter,
        )

        return (
            <View
                style={[styles.chartWrapper, {
                    backgroundColor: colorsReverse ? colors.white : colors.blue32,
                }]}
                onLayout={this.handleSetLayoutSize}>

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

                {this.hasPoints ? (
                    <View style={styles.chartRightWrapper}>

                        <Svg height={height} width={width}>
                            <Defs>
                                {lastPoint && (
                                    <RadialGradient
                                        id="endPointGrad"
                                        r="70"
                                        cx={lastPoint[0]}
                                        cy={lastPoint[1]}
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <Stop offset="0%" stopColor={colorsReverse ? colors.white : colors.blue33}
                                              stopOpacity="1"/>
                                        <Stop offset="16%" stopColor={colorsReverse ? colors.white : colors.blue32}
                                              stopOpacity="0.4"/>
                                    </RadialGradient>
                                )}
                                <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="100%">
                                    <Stop offset="0" stopColor="#43749d" stopOpacity="0.25"/>
                                    <Stop offset="1" stopColor={colorsReverse ? colors.blue32 : colors.white}
                                          stopOpacity="0"/>
                                </LinearGradient>

                                <LinearGradient id="borderGrad" x1="0" y1="0" x2="0" y2="100%">
                                    <Stop offset="0" stopColor={colorsReverse ? '#d7e0e8' : colors.white}
                                          stopOpacity="0"/>
                                    <Stop offset="80%" stopColor={colors.white}
                                          stopOpacity={colorsReverse ? '1' : '0'}/>
                                </LinearGradient>
                            </Defs>

                            {this.grid}

                            {(hasEndPoint && lastPoint) &&
                            <Circle cx={lastPoint[0]} cy={lastPoint[1]} r="23" fill="url(#endPointGrad)"/>}

                            <Path
                                d={fullPath}
                                stroke={colorsReverse ? colors.white : colors.blue33}
                                strokeWidth="6"
                                fill="none"
                                opacity="0.05"
                            />

                            <Path
                                d={fullPath}
                                stroke={colorsReverse ? colors.white : colors.blue33}
                                strokeWidth="8"
                                fill="none"
                                opacity="0.05"
                            />

                            <Path
                                d={fullPath}
                                stroke={colorsReverse ? colors.white : colors.blue33}
                                strokeWidth="10"
                                fill="none"
                                opacity="0.05"
                            />

                            <Path
                                d={fullPath}
                                stroke={colorsReverse ? colors.white : colors.blue33}
                                strokeWidth="12"
                                fill="none"
                                opacity="0.05"
                            />

                            <Path
                                d={fullPath}
                                stroke={colorsReverse ? colors.white : colors.blue33}
                                strokeWidth="14"
                                fill="none"
                                opacity="0.05"
                            />

                            {!this.isOneDayLength && (
                                <Path
                                    d={fillPath}
                                    stroke="none"
                                    fill="url(#bgGrad)"
                                />
                            )}

                            {hasEndPoint && (
                                <Path
                                    d={this.getBorderPath()}
                                    stroke="url(#borderGrad)"
                                    strokeWidth="0.5"
                                    fill="none"
                                />
                            )}

                            <Path
                                d={path}
                                stroke={colorsReverse ? colors.blue32 : colors.white}
                                strokeWidth="3.5"
                                fill="none"
                            />

                            {futureDataPoints.length ? (
                                <Path
                                    d={futurePath}
                                    stroke={colorsReverse ? colors.blue32 : colors.white}
                                    strokeWidth="3"
                                    strokeLinecap="square"
                                    fill="none"
                                    strokeDasharray="5, 7"
                                />
                            ) : null}

                            {(hasEndPoint && lastPoint) &&
                            <Circle
                                cx={!isLight ? lastPoint[0] : (width - 7)}
                                cy={lastPoint[1]}
                                r="6"
                                fill={colorsReverse ? colors.blue32 : colors.white}
                            />}

                            {isShowCreditLimit && (
                                <Path
                                    d={this.getCreditLimitPath()}
                                    stroke={colors.red5}
                                    strokeWidth="1"
                                    fill="none"
                                />
                            )}
                        </Svg>

                        {!isShowCreditLimit &&
                        <Text
                            style={styles.chartTotalBalanceText}>{numberFormat.format(Math.round(Math.abs(creditLimit)))}</Text>}

                        <View style={xAxisStyles}>
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
                ) : null}
            </View>
        )
    }
}
