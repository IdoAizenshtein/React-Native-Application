import React, { PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import Modal from 'src/components/Modal/Modal'
import SlikaRemoveConfirm from './components/SlikaRemoveConfirm'
import SlikaDetails from './components/SlikaDetails'

@withTranslation()
export default class SlikaEditModal extends PureComponent {
  constructor (props) {
    super(props)
    this.state = ({
      confirmRemoveModalIsOpen: false,
      solekDesc: props.item.solekDesc,
      companyAccountId: props.item.companyAccountId,
    })
  }

  handleToggleConfirmRemoveModal = () => {
    this.setState(
      { confirmRemoveModalIsOpen: !this.state.confirmRemoveModalIsOpen })
  }

  handleChangeName = (solekDesc) => {
    this.setState({ solekDesc: solekDesc })
  }

  handleApplyChanges = () => {
    const { solekDesc, companyAccountId } = this.state
    const { onUpdate } = this.props
    return solekDesc.length ? onUpdate({
      solekDesc,
      companyAccountId,
    }) : null
  }
  onRemove = () => {
    this.handleToggleConfirmRemoveModal()
    const { onRemove } = this.props
    setTimeout(() => {
      onRemove()
    }, 50)
  }

  changeAcc = (acc) => {
    this.setState({ companyAccountId: acc.companyAccountId })
  }

  render () {
    const { confirmRemoveModalIsOpen, solekDesc } = this.state
    const { t, onClose, item, isRtl, accounts } = this.props

    return (
      <Modal
        isOpen
        activeOpacity={(!solekDesc.length) ? 0.8 : 0}
        title={item.solekDesc}
        onLeftPress={onClose}
        onRightPress={this.handleApplyChanges}
        leftText={t('common:cancel')}
        rightText={t('common:apply')}
      >
        {item && (
          <SlikaDetails
            changeAcc={this.changeAcc}
            accounts={accounts}
            isRtl={isRtl}
            creditCard={item}
            name={solekDesc}
            onRemove={this.handleToggleConfirmRemoveModal}
            onChangeName={this.handleChangeName}
          />
        )}

        {confirmRemoveModalIsOpen ? (
          <SlikaRemoveConfirm
            item={item}
            onSubmit={this.onRemove}
            onClose={this.handleToggleConfirmRemoveModal}
          />
        ) : null}
      </Modal>
    )
  }
}
