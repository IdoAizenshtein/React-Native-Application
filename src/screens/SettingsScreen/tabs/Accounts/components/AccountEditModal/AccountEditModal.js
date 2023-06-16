import React, { PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import Modal from 'src/components/Modal/Modal'
import AccountRemoveConfirm from './components/AccountRemoveConfirm'
import AccountDetails from './components/AccountDetails'

@withTranslation()
export default class AccountEditModal extends PureComponent {
  constructor (props) {
    super(props)
    this.state = ({
      confirmRemoveModalIsOpen: false,
      isPrimaryAccount: props.item.primaryAccount,
      accountNickname: props.item.accountNickname,
    })
  }

  handleToggleConfirmRemoveModal = () => {
    this.setState(
      { confirmRemoveModalIsOpen: !this.state.confirmRemoveModalIsOpen })
  }

  handleTogglePrimaryAccount = () => this.setState(
    { isPrimaryAccount: !this.state.isPrimaryAccount })

  handleChangeAccountName = (accountNickname) => {
    this.setState({ accountNickname: accountNickname })
  }

  handleApplyChanges = () => {
    const { isPrimaryAccount, accountNickname } = this.state
    const { onUpdate } = this.props
    return accountNickname.length ? onUpdate({
      accountNickname,
      isPrimary: isPrimaryAccount,
    }) : null
  }

  onRemove = () => {
    this.setState({ confirmRemoveModalIsOpen: false })
    setTimeout(() => {
      this.props.onRemove()
    }, 300)
  }

  render () {
    const { confirmRemoveModalIsOpen, isPrimaryAccount, accountNickname } = this.state
    const { t, onClose, item } = this.props

    return (
      <Modal
        isOpen
        title={item.accountNickname}
        onLeftPress={onClose}
        activeOpacity={(!accountNickname.length) ? 0.8 : 0}
        onRightPress={this.handleApplyChanges}
        leftText={t('common:cancel')}
        rightText={t('common:apply')}
      >
        <AccountDetails
          account={item}
          isPrimaryAccount={isPrimaryAccount}
          accountNickname={accountNickname}
          onRemoveAccount={this.handleToggleConfirmRemoveModal}
          onTogglePrimaryAccount={this.handleTogglePrimaryAccount}
          onChangeAccountName={this.handleChangeAccountName}
        />

        {confirmRemoveModalIsOpen ? (
          <AccountRemoveConfirm
            account={item}
            onSubmit={this.onRemove}
            onClose={this.handleToggleConfirmRemoveModal}
          />
        ) : null}
      </Modal>
    )
  }
}
