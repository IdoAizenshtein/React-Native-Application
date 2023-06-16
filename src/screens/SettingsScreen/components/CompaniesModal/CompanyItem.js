import React, { PureComponent } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import Checker from 'src/components/Checker/Checker'
import { combineStyles as cs, sp } from 'src/utils/func'
import accountModalStyles
  from 'src/components/AccountsModal/AccountsModalStyles'
import styles from './CompaniesModalStyles'

export default class CompanyItem extends PureComponent {
  handleSelect = () => {
    const { company, onSelect } = this.props
    onSelect(company)
  }

  render () {
    const { isChecked, isRtl, company } = this.props
    const wrapperStyle = [cs(isRtl, styles.item, styles.itemRtl)]
    if (isChecked) {wrapperStyle.push(accountModalStyles.itemChecked)}

    return (
      <TouchableOpacity style={wrapperStyle} onPress={this.handleSelect}>
        {isChecked && (
          <View style={styles.checkerWrapper}>
            <Checker
              hasBackground={false}
              iconStyle={{ fontSize: sp(25) }}
              isChecked={isChecked}
            />
          </View>
        )}

        <Text style={cs(isChecked, accountModalStyles.itemText,
          styles.itemTextChecked)}>
          {company.companyName}
        </Text>
      </TouchableOpacity>
    )
  }
}
