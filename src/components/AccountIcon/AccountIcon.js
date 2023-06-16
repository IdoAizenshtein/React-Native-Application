import React, { PureComponent } from 'react'
import { Image } from 'react-native'
import {
  BANK_ICONS,
  CREDIT_CARD_ICONS,
  SLIKA_ICONS,
} from '../../constants/bank'

export default class AccountIcon extends PureComponent {
  render () {
    const { account, style, tokenType } = this.props
    if (tokenType && tokenType === 'CREDITCARD') {
      if (!account || !account.bankId || (!BANK_ICONS[account.bankId] &&
        !CREDIT_CARD_ICONS[account.bankId])) {
        return null
      }
      return <Image style={style}
                    source={BANK_ICONS[account.bankId]
                      ? BANK_ICONS[account.bankId].uri
                      : CREDIT_CARD_ICONS[account.bankId].uri}/>
    } else if (tokenType && tokenType === 'SLIKA') {
      if (!account || !account.bankId || (!SLIKA_ICONS[account.bankId] &&
        !SLIKA_ICONS[account.bankId])) {
        return null
      }
      return <Image
        resizeMode="contain"
        style={[
          style, {
            height: 20,
          }]}
        source={SLIKA_ICONS[account.bankId]
          ? SLIKA_ICONS[account.bankId].uri
          : SLIKA_ICONS[account.bankId].uri}/>
    } else {
      if (!account || !account.bankId ||
        !BANK_ICONS[account.bankId]) {
        return null
      }
      return <Image style={style} source={BANK_ICONS[account.bankId].uri}/>
    }
  }
}
