import { PureComponent } from 'react'
import { Animated } from 'react-native'
import { DATA_ROW_HEIGHT } from '../CashFlowStyles'

export default class AnimatedRow extends PureComponent {
  minHeight = 0

  maxHeight = DATA_ROW_HEIGHT

  constructor (props) {
    super(props)
    this.state = this.initialState

    this.handleToggle = this.handleToggle.bind(this)
    this.fixRowHeight = this.fixRowHeight.bind(this)
    this.setMinHeight = this.setMinHeight.bind(this)
    this.setMaxHeight = this.setMaxHeight.bind(this)
  }

  get initialState () {
    return {
      isOpen: false,
      height: new Animated.Value(DATA_ROW_HEIGHT),
      expandedData: [],
      inProgress: false,
    }
  }

  handleToggle () {
    const { isOpen, height, expandedData } = this.state
    const initialValue = isOpen
      ? this.maxHeight + this.minHeight
      : this.minHeight
    const finalValue = isOpen ? this.minHeight : this.maxHeight + this.minHeight

    this.setState({ isOpen: !isOpen })

    if (!isOpen && !expandedData.length) {this.getExpandedData()}
    // //console.log(initialValue)
    height.setValue(initialValue)
    Animated.timing(height, {
      toValue: finalValue,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  fixRowHeight () {
    const { isOpen, inProgress, height, expandedData } = this.state
    if (!isOpen || inProgress || !expandedData || !expandedData.length) {return}

    const initialValue = height.__getValue()
    const finalValue = this.maxHeight + this.minHeight
    // //console.log(initialValue)

    height.setValue(initialValue)
    Animated.timing(height, {
      toValue: finalValue,
      duration: 200,
      useNativeDriver: false,
    }).start()
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
}
