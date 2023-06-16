import React, { PureComponent } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import CustomIcon from 'src/components/Icons/Fontello'
import { combineStyles as cs } from 'src/utils/func'
import styles from './SettingsMenuStyles'
import { colors } from 'src/styles/vars'

export default class SettingsMenu extends PureComponent {
  handleSetTab = (tab) => () => this.props.onSetTab(tab)

  render () {
    const { menu, currentTab } = this.props

    return (
      <View style={cs(currentTab, styles.menuContainer,
        styles.menuContainerCollapsed)}>
        <ScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {currentTab && <View style={styles.menuTopBorder}/>}

          {menu.map(item => {
            return (
              <TouchableOpacity
                key={item.name}
                style={cs(currentTab === item.name, styles.menuRow,
                  styles.menuRowActive)}
                onPress={this.handleSetTab(item.name)}
              >
                {!currentTab &&
                <Text style={styles.menuText}>{item.title}</Text>}
                <CustomIcon name={item.icon} size={20}
                            color={currentTab === item.name
                              ? colors.white
                              : colors.blue5}/>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>
    )
  }
}
