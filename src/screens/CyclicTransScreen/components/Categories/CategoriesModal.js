import React, { Fragment, PureComponent } from 'react'
import {
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  Text,
  UIManager,
  View,
} from 'react-native'
import { throttle } from 'lodash'
import { withTranslation } from 'react-i18next'
import CustomIcon from '../../../../components/Icons/Fontello'
import Input from './Input'
import Modal from '../../../../components/Modal/Modal'
import { colors } from '../../../../styles/vars'
import { getAccountCflTransTypeApi } from '../../../../api'
import { CategoryCard } from './CategoryCard'
import modalStyles from '../../../../components/Modal/ModalStyles'
import styles, { REMOVE_BTN_SIZE } from './CategoriesStyles'

const ROW_SIZE = 3

const winHeight = Dimensions.get('window').height

@withTranslation()
export default class CategoriesModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      isReady: false,
      createInProgress: false,
      isDragMode: false,
      isScrolling: false,
      categories: [],
      draggedCategoryId: null,
      dropZonePosition: {
        x: 0,
        y: 0,
      },
      canBeRemove: false,
      newCategoryName: null,
      scrollOffsetY: 0,
      scrollSize: { width: 0, height: 0 },
    }

    this.removeBtnOpacity = new Animated.Value(0)
    this.removeBtnScale = new Animated.Value(1)

    this.handlePanResponderMove = throttle(this.handlePanResponderMove, 250)

    this.scollerPanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => false,
      onShouldBlockNativeResponder: () => false,
      onPanResponderRelease: () => this.setState({ isScrolling: false }),
    })
  }

    handleStartScroll = (e) => {
      this.setState({ isScrolling: true, scrollOffsetY: e.nativeEvent.contentOffset.y })
    };

    handleEndScroll = () => this.setState({ isScrolling: false });

    isDropZone = (gesture) => {
      const { dropZonePosition: { y } } = this.state
      return gesture.moveY > y
    };

    handlePanResponderMove = (e, gesture) => {
      if (!gesture) {return}
      if (this.isDropZone(gesture)) {
        this.setState({ canBeRemove: true })
        return Animated.spring(this.removeBtnScale, { toValue: 2, useNativeDriver: true }).start()
      }

      this.setState({ canBeRemove: false })
      return Animated.spring(this.removeBtnScale, { toValue: 1, useNativeDriver: true }).start()
    };

    handleSetDragMode = () => {
      this.setState({ isDragMode: true }, () => {
        Animated.timing(this.removeBtnOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start()
      })
    };

    handleOffDragMode = (transTypeId) => {
      const { canBeRemove } = this.state

      if (canBeRemove) {this.removeCategory(transTypeId)}

      Animated.spring(this.removeBtnScale, { toValue: 1, useNativeDriver: true }).start()
      Animated.timing(this.removeBtnOpacity, { toValue: 0, duration: 300, useNativeDriver: true })
        .start(() => this.setState({ isDragMode: false }))
    };

    handleSetDropZonePosition = ({ nativeEvent }) => {
      UIManager.measure(nativeEvent.target, (x, y, width, height, pageX, pageY) => {
        this.setState({ dropZonePosition: { x: pageX, y: pageY } })
      })
    };

    removeCategory = (transTypeId) => {
      const { onRemoveCategory, onUpdateBankTrans, bankTrans } = this.props
      const { isDragMode, categories } = this.state
      if (!isDragMode) {return}

      this.setState({
        categories: this.state.categories.filter(c => c.transTypeId !== transTypeId),
        draggedCategoryId: null,
        companyId: { x: 0, y: 0 },
      })

      if (transTypeId === bankTrans.transTypeId) {
        const category = categories.find(c => c.createDefaultSupplier)
        onUpdateBankTrans({
          ...bankTrans,
          transTypeId: category.transTypeId,
          transTypeName: category.transTypeName,
        })
      }

      return onRemoveCategory(transTypeId)
    };

    handleCreateCategory = () => {
      const { onCreateCategory } = this.props
      const { newCategoryName, createInProgress } = this.state
      if (createInProgress || !newCategoryName) {return}
      this.setState({ createInProgress: true })
      return onCreateCategory(newCategoryName)
        .then((transTypeId) => {
          this.setState({
            categories: [...this.state.categories, { transTypeId, transTypeName: newCategoryName }],
            newCategoryName: null,
            createInProgress: false,
          })
        })
    };

    handleChangeCategoryName = (newCategoryName) => {
      this.setState({ newCategoryName })
    };

    handleSetScrollContentSize = (width, height) => this.setState({ scrollSize: { width, height } });

    fixScrollView = ref => {
      ref.scrollResponderHandleStartShouldSetResponder = () => true
    };

    componentDidMount () {
      if (this.props.companyId) {
        getAccountCflTransTypeApi.post({ body: { uuid: this.props.companyId } })
          .then(data => this.setState({ categories: data, isReady: true }))
      }
    }

    render () {
      const { t, isRtl, isOpen, onClose, bankTrans, onSelectCategory } = this.props

      const {
        categories,
        isDragMode,
        scrollOffsetY,
        newCategoryName,
        createInProgress,
        scrollSize,
        isScrolling,
      } = this.state

      return (
        <Modal
          isOpen={isOpen}
          onLeftPress={onClose}
          leftText={t('common:cancel')}
          title={t('bankAccount:selectCategory')}
        >
          <ScrollView
            keyboardShouldPersistTaps="always"
            scrollEnabled={!isDragMode}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.categoriesContainer, { overflow: 'hidden' }]}
            onScroll={this.handleStartScroll}
            onScrollEndDrag={this.handleEndScroll}
            onMomentumScrollEnd={this.handleEndScroll}
            onContentSizeChange={this.handleSetScrollContentSize}
            scrollEventThrottle={16}
            {...this.scollerPanResponder.panHandlers}
          >
            {categories.map((c, i) => {
              const isSelected = bankTrans.transTypeId === c.transTypeId

              return (
                <Fragment key={c.transTypeId}>
                  <CategoryCard
                    isScrolling={isScrolling}
                    canDrag={!c.createDefaultSupplier}
                    isSelected={isSelected}
                    category={c}
                    onSelect={onSelectCategory}
                    onSetDragMode={this.handleSetDragMode}
                    onRelease={this.handleOffDragMode}
                    onMove={this.handlePanResponderMove}
                  />
                  {(i !== 0 && (i + 1) % ROW_SIZE === 0) && <View style={styles.categoriesDivider} />}
                </Fragment>
              )
            })}

            <Animated.View
              style={[styles.removeBtn, {
                top: scrollOffsetY + winHeight - 220,
                left: (scrollSize.width / 2) - (REMOVE_BTN_SIZE / 2),
                opacity: this.removeBtnOpacity,
                transform: [{ scale: this.removeBtnScale }],
              }]}
              onLayout={this.handleSetDropZonePosition}
            >
              <CustomIcon name="trash" size={25} color={colors.white} />
            </Animated.View>
          </ScrollView>

          {!isDragMode && (
            <View style={[modalStyles.modalFooter, styles.modalFooter]}>
              <Text style={styles.submitBlockTitle}>{t('bankAccount:addNewCategory')}</Text>
              <Input
                isRtl={isRtl}
                inProgress={createInProgress}
                onSubmit={this.handleCreateCategory}
                value={newCategoryName}
                onChange={this.handleChangeCategoryName}
              />
            </View>
          )}
        </Modal>
      )
    }
}
