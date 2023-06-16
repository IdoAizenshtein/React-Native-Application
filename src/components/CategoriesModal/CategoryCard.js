import React, {PureComponent} from 'react'
import {Text, TextInput, TouchableOpacity, View} from 'react-native'
import {combineStyles as cs, getTransCategoryIcon} from 'src/utils/func'
import styles from './CategoriesStyles'
import commonStyles from 'src/styles/styles'
import {colors} from 'src/styles/vars'
import CustomIcon from 'src/components/Icons/Fontello'

export class CategoryCard extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            name: props.category.transTypeName,
        }
    }

    handleSelect = () => {
        const {onSelect, category, isEditMode} = this.props
        if (isEditMode) {return}
        return onSelect(category)
    };

    handleRemove = () => {
        const {onRemove, category} = this.props
        return onRemove(category.transTypeId)
    };

    handleUpdateName = () => {
        const {name} = this.state

        const {onUpdateCategoryName, category} = this.props
        if (!name) {return this.handleSkipEdit()}
        return onUpdateCategoryName({...category, transTypeName: name})
    };

    handleSkipEdit = () => {
        const {
            onBlur,
        } = this.props
        onBlur()
        this.handleUpdateName()
    };

    handleChangeName = (name) => this.setState({name});

    render() {
        const {
            category,
            isSelected,
            onLongPress,
            isEditMode,
            isEditable,
            onFocus,
        } = this.props
        const {name} = this.state

        if (isEditMode && isEditable) {
            return (
                <View style={[styles.cardWrapper, styles.editCategoryCard]}>
                    <View style={commonStyles.alignItemsCenter}>
                        <View style={styles.cardInner}>
                            <CustomIcon
                                name={getTransCategoryIcon(category.iconType)}
                                size={35}
                                color={colors.blue8}
                            />
                        </View>
                        <TextInput
                            style={styles.nameTextInput}
                            value={name}
                            multiline={false}
                            onChangeText={this.handleChangeName}
                            onBlur={this.handleSkipEdit}
                            onFocus={onFocus}
                            onSubmitEditing={this.handleUpdateName}
                            underlineColorAndroid="rgba(0,0,0,0)"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={this.handleRemove}
                        hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                    >
                        <CustomIcon
                            name="times"
                            size={11}
                            color={colors.blue8}
                        />
                    </TouchableOpacity>
                </View>
            )
        }

        return (
            <TouchableOpacity onPress={this.handleSelect} onLongPress={onLongPress}>
                <View style={styles.cardWrapper}>
                    <View style={commonStyles.alignItemsCenter}>
                        <View style={cs(isSelected, styles.cardInner, styles.cardInnerSelected)}>
                            <CustomIcon
                                name={getTransCategoryIcon(category.iconType)}
                                size={35}
                                color={isSelected ? colors.white : colors.blue8}
                            />
                        </View>
                        <Text
                            style={cs(isSelected, styles.cardText, styles.cardTextSelected)}
                            numberOfLines={1}
                        >
                            {name}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}
