import React, {PureComponent} from 'react'
import {PieChart} from 'react-native-svg-charts'
import {Text} from 'react-native-svg'
import {View} from 'react-native'
import {TextPieCenter} from './TextPieCenter'
import {fonts} from '../../styles/vars'

export class Pie extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            selectedSlice: {
                label: '',
                value: 0,
            },
        }
    }

    render() {
        const {
            title,
            keys,
            colors,
            values,
            press,
            currentOpenItemIndex,
        } = this.props
        // const {
        //   selectedSlice,
        // } = this.state
        // const { label, value } = selectedSlice
        const dataBase = keys.map((key, index) => {
            return {
                key: key.val,
                prc: key.prc,
                value: values[index],
                svg: {fill: (currentOpenItemIndex === index) ? colors[index] : (title.income) ? '#e6f5ed' : '#fcf1f2'},
                arc: {outerRadius: (currentOpenItemIndex === index) ? 95 : 100 + '%', padAngle: 0.01},
                onPress: () => {
                    this.setState({selectedSlice: {label: key.val, value: values[index]}})
                    press(title.income, key.idx)
                },
            }
        })
        // const reducer = (accumulator, currentValue) => accumulator + currentValue
        // const totalArr = values.reduce(reducer)
        const dataInside = keys.map((key, index) => {
            return {
                key: key.val,
                value: values[index],
                svg: {fill: colors[index]},
                arc: {outerRadius: 100 + '%', padAngle: 0.01},
            }
        })
        // const deviceWidth = Dimensions.get('window').width
        const Labels = ({slices, height, width}) => {
            return slices.map((slice, index) => {
                const {pieCentroid, data} = slice

                return (
                    <Text
                        fontFamily={fonts.regular}
                        key={index}
                        x={pieCentroid[0]}
                        y={pieCentroid[1]}
                        fill={currentOpenItemIndex === index ? '#ffffff' : '#0f3860'}
                        textAnchor={'middle'}
                        alignmentBaseline={'middle'}
                        fontSize={14}
                        stroke={currentOpenItemIndex === index ? '#ffffff' : '#0f3860'}
                        strokeWidth={0.1}>
                        {(data.prc && data.prc > 10) ? `${data.prc}%` : ''}
                    </Text>
                )
            })
        }
        return (
            <View style={{
                flexDirection: 'column',
                alignSelf: 'center',
                justifyContent: 'center',
                flex: 1,
                height: 220,
                width: 220,
                alignItems: 'center',
                alignContent: 'center',
            }}>
                <PieChart
                    valueAccessor={({item}) => item.value}
                    spacing={0}
                    style={{
                        zIndex: 2,
                        top: 2.5,
                        height: 215,
                        width: 215,
                        position: 'absolute',
                        left: 2.5,
                    }}
                    outerRadius={'80%'}
                    innerRadius={'45%'}
                    data={dataBase}>
                    <Labels/>
                </PieChart>
                <TextPieCenter selectedSlice={title}/>
                <PieChart
                    spacing={0}
                    style={{
                        zIndex: 10,
                        top: 54,
                        position: 'absolute',
                        left: 54,
                        width: 112,
                        height: 112,
                    }}
                    outerRadius={'82%'}
                    innerRadius={'75%'}
                    data={dataInside}
                />
            </View>
        )
    }
}
