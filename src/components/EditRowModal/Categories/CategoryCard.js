import React, {PureComponent} from 'react'
import {Animated, Easing, PanResponder, Text, View} from 'react-native'
import {combineStyles as cs, getTransCategoryIcon} from '../../../utils/func'
import styles from './CategoriesStyles'
import commonStyles from '../../../styles/styles'
import CustomIcon from 'src/components/Icons/Fontello'
import {colors} from 'src/styles/vars'

export class CategoryCard extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {isDragged: false, isScrolling: false}

        this.isPress = false
        this.isLongPress = false
        this.isScrolling = false

        this.pan = new Animated.ValueXY()
        this.categoryCardRotate = new Animated.Value(0)
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => false,
            onMoveShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponderCapture: () => false,
            onShouldBlockNativeResponder: () => false,
            onPanResponderGrant: () => {
                this.setPrePressStatus()
            },
            onPanResponderTerminationRequest: () => false,
            onPanResponderTerminate: () => {
                this.resetAnimations()
            },
            onPanResponderMove: Animated.event(
                [null, {dx: this.pan.x, dy: this.pan.y}],
                {listener: this.props.onMove},
            ),
            onPanResponderRelease: () => {
                if (this.isPress) {this.handleSelect()}
                this.resetAnimations()
            },
        })
    }

    setPrePressStatus = () => {
        this.isPress = true
        this.isLongPress = true

        setTimeout(() => {
            this.isPress = false
        }, 70)

        setTimeout(() => {
            if (!this.isLongPress || this.isScrolling) {return}
            this.isLongPress = false
            this.handleDrag()
        }, 1000)
    };

    resetAnimations = () => {
        const {onRelease, category} = this.props

        this.isPress = false
        this.isLongPress = false

        Animated.timing(this.categoryCardRotate, {
            toValue: 0,
            duration: 300,
            easing: Easing.bounce,
            useNativeDriver: true,
        }).start()

        Animated.spring(this.pan, {
            toValue: {x: 0, y: 0},
            speed: 50,
            bounciness: 1,
            useNativeDriver: true,
        }).start(() => {
            this.pan.resetAnimation()
            this.setState({isDragged: false})
        })

        onRelease(category.transTypeId)
    };

    handleDrag = () => {
        const {canDrag, onSetDragMode} = this.props
        if (!canDrag) {return}

        this.setState({isDragged: true}, () => {
            onSetDragMode()
            Animated.timing(this.categoryCardRotate, {
                toValue: 1,
                duration: 500,
                easing: Easing.bounce,
                useNativeDriver: true,
            }).start()
        })
    };

    handleSelect = () => {
        const {onSelect, category} = this.props
        return onSelect(category)
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.isScrolling = nextProps.isScrolling
    }

    render() {
        const {category, isSelected} = this.props
        const {isDragged} = this.state

        const categoryRotate = this.categoryCardRotate.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '-35deg'],
        })

        return (
            <Animated.View
                {...this.panResponder.panHandlers}
                style={cs(isDragged, {}, {
                    zIndex: 3,
                    elevation: 3,
                    transform: [...this.pan.getTranslateTransform(), {rotate: categoryRotate}],
                })}
            >
                <View style={styles.cardWrapper}>
                    {isDragged ? (
                        <View style={styles.draggableCardInner}>
                            <CustomIcon name={getTransCategoryIcon(category.iconType)} size={24} color={colors.blue8}/>
                            <Text style={styles.draggableCardText} numberOfLines={1}>{category.transTypeName}</Text>
                        </View>
                    ) : (
                        <View pointerEvents="none" style={commonStyles.alignItemsCenter}>
                            <View style={cs(isSelected, styles.cardInner, styles.cardInnerSelected)}>
                                <CustomIcon name={getTransCategoryIcon(category.iconType)} size={35}
                                            color={colors.blue8}/>
                            </View>
                            <Text
                                style={cs(isSelected, styles.cardText, commonStyles.boldFont)}
                                numberOfLines={1}>
                                {category.transTypeName}
                            </Text>
                        </View>
                    )}
                </View>
            </Animated.View>
        )
    }
}
