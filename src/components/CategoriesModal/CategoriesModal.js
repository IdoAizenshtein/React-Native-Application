import React, { Fragment, PureComponent } from 'react'
import { Dimensions, Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import Input from './Input'
import Modal from 'src/components/Modal/Modal'
import {
  getAccountCflTransTypeApi,
  updateAccountCflTransTypeApi,
} from '../../api'
import { CategoryCard } from './CategoryCard'
import modalStyles from 'src/components/Modal/ModalStyles'
import styles from './CategoriesStyles'
import Loader from 'src/components/Loader/Loader'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { colors } from '../../styles/vars'

const win = Dimensions.get('window')

const ROW_SIZE = 3

@withTranslation()
export default class CategoriesModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      isReady: false,
      createInProgress: false,
      categories: [],
      newCategoryName: null,
      isEditMode: false,
      focusActive: false,
    }
  }

  handleLongPress = () => this.setState({ isEditMode: true })

  handleEndEditModePress = () => this.setState({ isEditMode: false })

  removeCategory = (transTypeId) => {
    const { onRemoveCategory, onUpdateBankTrans, bankTrans } = this.props
    const { categories } = this.state

    this.setState({
      categories: this.state.categories.filter(
        c => c.transTypeId !== transTypeId),
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
  }

  handleCreateCategory = () => {
    const { onCreateCategory } = this.props
    const { newCategoryName, createInProgress } = this.state
    if (createInProgress || !newCategoryName) {return}
    this.setState({
      isReady: false,
      createInProgress: true,
    })
    return onCreateCategory(newCategoryName)
      .then((transTypeId) => {
        if (this.props.companyId) {
          getAccountCflTransTypeApi.post(
            { body: { uuid: this.props.companyId } })
            .then(data => {
              this.setState({
                categories: data.filter(c => c.shonaScreen),
                isReady: true,
                newCategoryName: null,
                createInProgress: false,
              })
            })
        }
      })
  }

  handleUpdateNewCategoryName = (newCategoryName) => this.setState(
    { newCategoryName })

  handleChangeCategory = (newCategory) => {
    this.setState({ isReady: false })

    return updateAccountCflTransTypeApi.post({
      body: newCategory,
    }).then(() => {
      if (this.props.companyId) {
        getAccountCflTransTypeApi.post({ body: { uuid: this.props.companyId } })
          .then(data => {
            this.setState({
              categories: data.filter(c => c.shonaScreen),
              isReady: true,
            })
          })
      }
    })
  }

  componentDidMount () {
    if (this.props.companyId) {
      getAccountCflTransTypeApi.post({ body: { uuid: this.props.companyId } })
        .then(data => this.setState({
          categories: data.filter(c => c.shonaScreen),
          isReady: true,
        }))
    }
  }

  focusInput = () => {
    this.setState({
      focusActive: true,
    })
  }
  blurInput = () => {
    this.setState({
      focusActive: false,
    })
  }

  render () {
    const { t, isRtl, isOpen, onClose, bankTrans, onSelectCategory } = this.props
    const {
      categories,
      isEditMode,
      newCategoryName,
      createInProgress,
      isScrolling,
      isReady,
      focusActive,
    } = this.state
    // console.log(isEditMode)
    return (
      <Modal
        isOpen={isOpen}
        onLeftPress={onClose}
        leftText={t('common:cancel')}
        title={t('bankAccount:selectCategory')}
      >
        <KeyboardAwareScrollView
          enableOnAndroid={true}
          enableAutomaticScroll={!focusActive}
          extraScrollHeight={120}
          extraHeight={120}
          nestedScrollEnabled
          style={[
            styles.contentContainer, {
              flex: 1,
            }]}
          contentContainerStyle={[
            {
              flexGrow: 1,
              backgroundColor: colors.white,
              width: '100%',
            }]}
          scrollEnabled={false}>
          <KeyboardAwareScrollView
            enableOnAndroid={true}
            nestedScrollEnabled
            scrollEnabled
            extraScrollHeight={120}
            extraHeight={120}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
            style={{
              backgroundColor: 'white',
              flex: 1,
              position: 'relative',
              maxHeight: win.height - 170,
            }}
            contentContainerStyle={[
              styles.categoriesContainer, {
                flexGrow: 1,
                paddingTop: 20,
                overflow: 'hidden',
                paddingBottom: 170,
              }]}
            scrollEventThrottle={16}
          >
            <TouchableOpacity
              onPress={this.handleEndEditModePress}
              activeOpacity={0}
              style={styles.bgBtn}
            />

            {!isReady && (<Loader/>)}
            {isReady && categories.map((c, i) => {
              const isSelected = bankTrans.transTypeId === c.transTypeId

              return (
                <Fragment key={c.transTypeId}>
                  <CategoryCard
                    isScrolling={isScrolling}
                    isEditMode={isEditMode}
                    isEditable={!c.createDefaultSupplier && c.companyId !==
                    '00000000-0000-0000-0000-000000000000'}
                    isSelected={isSelected}
                    category={c}
                    onFocus={this.focusInput}
                    onBlur={this.blurInput}
                    onSelect={onSelectCategory}
                    onLongPress={this.handleLongPress}
                    onUpdateCategoryName={this.handleChangeCategory}
                    onRemove={this.removeCategory}
                  />
                  {(i !== 0 && (i + 1) % ROW_SIZE === 0) &&
                  <View style={styles.categoriesDivider}/>}
                </Fragment>
              )
            })}
          </KeyboardAwareScrollView>
          <View style={[modalStyles.modalFooter, styles.modalFooter]}>
            <Text style={styles.submitBlockTitle}>{t(
              'bankAccount:addNewCategory')}</Text>
            <Input
              isRtl={isRtl}
              inProgress={createInProgress}
              value={newCategoryName}
              onSubmit={this.handleCreateCategory}
              onChange={this.handleUpdateNewCategoryName}
            />
          </View>
        </KeyboardAwareScrollView>

      </Modal>
    )
  }
}
