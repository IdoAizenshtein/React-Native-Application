import React, { Fragment, PureComponent } from 'react'
import CategoriesModal from 'src/components/CategoriesModal/CategoriesModal'
import SectionRowLevelOne from './SectionRowLevelOne'

export default class SectionRowWrapper extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      categoriesModalIsOpen: false,
      currentEditBankTrans: props.bankTrans,
    }
  }

    // UNSAFE_componentWillReceiveProps (props) {
    //   if (props.bankTrans.transTypeId !== this.props.bankTrans.transTypeId) {
    //     debugger
    //   }
    // }
    handleSelectCategory = (category) => {
      const { currentEditBankTrans } = this.state
      if (!currentEditBankTrans || currentEditBankTrans.transTypeId === category.transTypeId) {return}

      const newBankTrans = {
        ...currentEditBankTrans,
        iconType: category.iconType,
        transTypeId: category.transTypeId,
        transTypeName: category.transTypeName,
      }

      return this.handleUpdateBankTrans(newBankTrans)
    };

    handleCloseCategoriesModal = () => {
      this.setState({ categoriesModalIsOpen: false })
    };

    handleOpenCategoriesModal = (bankTransId) => () => {
      this.setState({ categoriesModalIsOpen: true, currentEditBankTrans: bankTransId })
    };

    handleUpdateBankTrans = (newBankTrans) => {
      this.setState({ currentEditBankTrans: { ...newBankTrans }, categoriesModalIsOpen: false })
      this.props.onUpdateBankTrans({ ...newBankTrans })
      // setTimeout(() => this.setState({ categoriesModalIsOpen: false }), 800)
    };

    handleUpdateBankTransText = (newBankTrans) => {
      this.setState({ currentEditBankTrans: { ...newBankTrans }, categoriesModalIsOpen: false })
      this.props.onUpdateBankTransText({ ...newBankTrans })
      // setTimeout(() => this.setState({ categoriesModalIsOpen: false }), 800)
    };

    render () {
      const {
        isRtl,
        companyId,
        account,
        isOpen,
        onRemoveBankTransCategory,
        onCreateBankTransCategory,
        onItemToggle,
        disabledEdit,
        queryStatus,
      } = this.props
      const { categoriesModalIsOpen, currentEditBankTrans } = this.state

      return (
        <Fragment>
          <SectionRowLevelOne
            queryStatus={queryStatus}
            disabledEdit={disabledEdit}
            isOpen={isOpen}
            isRtl={isRtl}
            bankTrans={currentEditBankTrans}
            account={account}
            onItemToggle={onItemToggle}
            onEditCategory={this.handleOpenCategoriesModal}
            onUpdateBankTrans={this.handleUpdateBankTrans}
            onUpdateBankTransText={this.handleUpdateBankTransText}
          />

          {categoriesModalIsOpen && (
            <CategoriesModal
              isOpen
              isRtl={isRtl}
              companyId={companyId}
              bankTrans={currentEditBankTrans}
              onClose={this.handleCloseCategoriesModal}
              onUpdateBankTrans={this.handleUpdateBankTrans}
              onSelectCategory={this.handleSelectCategory}
              onCreateCategory={onCreateBankTransCategory}
              onRemoveCategory={onRemoveBankTransCategory}
            />
          )}
        </Fragment>
      )
    }
}
