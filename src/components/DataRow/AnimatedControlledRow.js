import {Animated} from 'react-native'
import AnimatedRow from './AnimatedRow'

export default class AnimatedControlledRow extends AnimatedRow {
    constructor(props) {
        super(props)

        this.handleClose = this.handleClose.bind(this)
        this.handleOpen = this.handleOpen.bind(this)
    }

    fixRowHeight() {
        const {inProgress, height} = this.state
        const {isOpen} = this.props

        if (!isOpen || inProgress || !this.hasExpandedData) {return}

        const initialValue = height.__getValue()
        const finalValue = this.maxHeight + this.minHeight

        height.setValue(initialValue)
        Animated.timing(height, {toValue: finalValue, duration: 200, useNativeDriver: false}).start()
    }

    handleOpen() {
        const {height} = this.state
        const initialValue = this.minHeight
        const finalValue = this.maxHeight + this.minHeight

        if (!this.hasExpandedData) {this.getExpandedData()}

        height.setValue(initialValue)
        Animated.timing(height, {toValue: finalValue, duration: 200, useNativeDriver: false}).start()
    }

    handleClose() {
        const {height} = this.state
        const initialValue = this.maxHeight + this.minHeight
        const finalValue = this.minHeight

        height.setValue(initialValue)
        Animated.timing(height, {toValue: finalValue, duration: 200, useNativeDriver: false}).start()
    }

    UNSAFE_componentWillReceiveProps({isOpen}) {
        if (this.props.isOpen && !isOpen) {return this.handleClose()}
        if (!this.props.isOpen && isOpen) {return this.handleOpen()}
    }
}
