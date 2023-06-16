import React, { PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import Modal from 'src/components/Modal/Modal'
import CreditCardRemoveConfirm from './components/CreditCardRemoveConfirm'
import CreditCardDetails from './components/CreditCardDetails'
import { getEmoji } from '../../../../../../utils/func'

@withTranslation()
export default class CreditCardEditModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = ({
      tokenType: props.tokenType,
      confirmRemoveModalIsOpen: false,
      name: props.item.creditCardNickname,
      companyAccountId: props.item.companyAccountId,
      creditLimit: props.item.creditLimit,
    })
  }

  handleToggleConfirmRemoveModal = () => {
    this.setState(
      { confirmRemoveModalIsOpen: !this.state.confirmRemoveModalIsOpen })
  }

  handleChangeName = (name) => {
    this.setState({ name: name })
  }
  handleChangeCreditLimit = (creditLimit) => {
    let value = creditLimit || ''
    value = value.toString().replace(getEmoji(), '').replace(/[^\d]/g, '')
    this.setState({ creditLimit: value })
  }
  handleApplyChanges = () => {
    const { name, companyAccountId, creditLimit } = this.state
    const { onUpdate } = this.props
    return (name.length ||
      (creditLimit && creditLimit !== this.props.item.creditLimit)) ? onUpdate({
      name,
      companyAccountId,
      creditLimit: ((creditLimit !== this.props.item.creditLimit)
        ? creditLimit
        : this.props.item.creditLimit),
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
    const { confirmRemoveModalIsOpen, name, creditLimit } = this.state
    const { t, onClose, item, accounts, isRtl } = this.props

    return (
      <Modal
        isOpen
        title={item.creditCardNickname}
        onLeftPress={onClose}
        activeOpacity={(!name.length) ? 0.8 : 0}
        onRightPress={this.handleApplyChanges}
        leftText={t('common:cancel')}
        rightText={t('common:apply')}
      >
        {item && (
          <CreditCardDetails
            changeAcc={this.changeAcc}
            accounts={accounts}
            isRtl={isRtl}
            creditCard={item}
            name={name}
            creditLimit={creditLimit}
            onChangeCreditLimit={this.handleChangeCreditLimit}
            onRemove={this.handleToggleConfirmRemoveModal}
            onChangeName={this.handleChangeName}
          />
        )}

        {confirmRemoveModalIsOpen ? (
          <CreditCardRemoveConfirm
            item={item}
            onSubmit={this.onRemove}
            onClose={this.handleToggleConfirmRemoveModal}
          />
        ) : null}
      </Modal>
    )
  }
}
