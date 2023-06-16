import {PureComponent} from 'react'
import {isEmpty} from 'lodash'
import {Animated} from 'react-native'

export default class AnimatedRow extends PureComponent {
    constructor(props) {
        super(props)

        this.minHeight = 0
        this.maxHeight = 0
        this.initialHeight = 0
    this.state = this.initialState

    this.handleToggle = this.handleToggle.bind(this)
    this.fixRowHeight = this.fixRowHeight.bind(this)
    this.setMinHeight = this.setMinHeight.bind(this)
    this.setMaxHeight = this.setMaxHeight.bind(this)
  }

  get initialState () {
    return {
      isOpen: false,
      height: new Animated.Value(this.initialHeight),
      expandedData: [],
      inProgress: false,
    }
  }

  get hasExpandedData () {
    return !isEmpty(this.state.expandedData)
  }

  handleToggle () {
    const { isOpen, height, expandedData } = this.state
    const initialValue = isOpen ? this.maxHeight + this.minHeight : this.minHeight
    const finalValue = isOpen ? this.minHeight : this.maxHeight + this.minHeight

    this.setState({ isOpen: !isOpen })
    if (!isOpen && !expandedData.length) {this.getExpandedData()}
    if (isOpen) {this.cbIsClose()}

    height.setValue(initialValue)
    Animated.timing(height, { toValue: finalValue, duration: 200, useNativeDriver: false }).start()
  }

  fixRowHeight () {
    const { isOpen, inProgress, height } = this.state
    if (!isOpen || inProgress || !this.hasExpandedData) {return}

    const initialValue = height.__getValue()
    const finalValue = this.maxHeight + this.minHeight

    height.setValue(initialValue)
    Animated.timing(height, { toValue: finalValue, duration: 200, useNativeDriver: false }).start()
  }

  setMinHeight (e) {
    this.minHeight = e.nativeEvent.layout.height
  }

  setMaxHeight (e) {
    this.maxHeight = e.nativeEvent.layout.height
    this.fixRowHeight()
  }

  getExpandedData () {
    return null
  }

  cbIsClose () {
    return true
  }
}
