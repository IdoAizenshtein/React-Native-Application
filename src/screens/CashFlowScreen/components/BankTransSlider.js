import React, { Fragment, PureComponent } from 'react'
import { Dimensions, Image, Text, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import LinearGradient from 'react-native-linear-gradient'
import TextIcon from '../../../components/Icons/TextIcon'
import { combineStyles as cs } from '../../../utils/func'
import { colors } from '../../../styles/vars'
import commonStyles from '../../../styles/styles'
import styles, { SLIDER_IMG_HEIGHT } from '../CashFlowStyles'
import Loader from '../../../components/Loader/Loader'
import AccountIcon from '../../../components/AccountIcon/AccountIcon'
import AppTimezone from '../../../utils/appTimezone'
import { DEFAULT_DATE_FORMAT, IS_IOS } from '../../../constants/common'

const winWidth = Dimensions.get('window').width

@withTranslation()
export default class BankTransSlider extends PureComponent {
  state = {
    width: 100,
    activeSlide: 0,
  }

  handleSnapToItem = (index) => this.setState({ activeSlide: index })

  renderItem = ({ item, index }) => {
    const { cashFlowDetailsDataItem } = this.props

    return (
      <LinearGradient
        locations={[0, 0.5, 1]}
        colors={[colors.blue10, colors.blue11, colors.blue12]}
        style={styles.sliderItemGradient}
      >
        {item
          ? cashFlowDetailsDataItem.pictureLink
            ? this.blockWithImg(item)
            : this.simpleBlock(item)
          : <Text>Not found</Text>}
      </LinearGradient>
    )
  }

  simpleBlock = (item) => {
    const { cashFlowDetailsData, isRtl, t } = this.props
    const rowStyles = cs(isRtl, styles.sliderRow, commonStyles.rowReverse)

    return (
      <Fragment>
        <View style={rowStyles}>
          <View style={styles.sliderRowTextGroup}>
            <Text style={styles.sliderRowTitle}>{t('bankAccount:bank')}</Text>
            <View
              style={cs(isRtl, commonStyles.row, [commonStyles.rowReverse])}>
              <AccountIcon account={{ bankId: item.banktransfernumber }}/>
              <View style={commonStyles.spaceDivider}/>
              <Text
                style={styles.sliderRowValue}>{item.branchtransfernumber}</Text>
            </View>
          </View>

          <View style={styles.sliderRowTextGroup}>
            <Text style={styles.sliderRowTitle}>{t('bankAccount:amount')}</Text>
            <TextIcon
              isRtl={isRtl}
              text={item.transfertotal}
              textStyle={styles.sliderRowValue}
              iconName="money"
              iconSize={18}
              iconColor={colors.white}
            />
          </View>
        </View>

        <View style={rowStyles}>
          <View style={styles.sliderRowTextGroup}>
            <Text style={styles.sliderRowTitle}>{t(
              'bankAccount:invoice')}</Text>
            <TextIcon
              isRtl={isRtl}
              text={item.accounttransfernumber}
              textStyle={styles.sliderRowValue}
              iconName="wallet"
              iconSize={14}
              iconColor={colors.white}
            />
          </View>

          <View style={styles.sliderRowTextGroup}>
            <Text style={styles.sliderRowTitle}>
              {t(`bankAccount:${cashFlowDetailsData.hova
                ? 'nameOfBeneficiary'
                : 'nameOfTransferor'}`)}
            </Text>
            <Text style={styles.sliderRowValue}>{item.namepayertransfer}</Text>
          </View>

        </View>

        <View style={[rowStyles, styles.sliderRowLast]}>
          <View style={styles.sliderRowTextGroup}>
            <Text style={styles.sliderRowTitle}>{t('bankAccount:note')}</Text>
            <Text style={styles.sliderRowValue}>{item.detailstransfer}</Text>
          </View>
        </View>
      </Fragment>
    )
  }

  blockWithImg = (item) => {
    const { isRtl, t } = this.props
    const { width } = this.state

    const rowStyles = cs(isRtl, styles.sliderRow, commonStyles.rowReverse)

    return (
      <Fragment>
        <View style={rowStyles}>
          <View style={styles.sliderRowTextGroup}>
            <Text style={styles.sliderRowTitle}>{t('bankAccount:bank')}</Text>
            <View
              style={cs(isRtl, commonStyles.row, [commonStyles.rowReverse])}>
              <AccountIcon account={{ bankId: item.chequeBankNumber }}/>
              <View style={commonStyles.spaceDivider}/>
              <Text
                style={styles.sliderRowValue}>{item.chequeBranchNumber}</Text>
            </View>
          </View>

          <View style={styles.sliderRowTextGroup}>
            <Text style={styles.sliderRowTitle}>{t('bankAccount:amount')}</Text>
            <TextIcon
              isRtl={isRtl}
              text={item.chequeTotal}
              textStyle={styles.sliderRowValue}
              iconName="money"
              iconSize={18}
              iconColor={colors.white}
            />
          </View>
        </View>

        <View style={rowStyles}>
          <View style={styles.sliderRowTextGroup}>
            <Text style={styles.sliderRowTitle}>{t(
              'bankAccount:invoice')}</Text>
            <TextIcon
              isRtl={isRtl}
              text={item.chequeAccountNumber}
              textStyle={styles.sliderRowValue}
              iconName="wallet"
              iconSize={14}
              iconColor={colors.white}
            />
          </View>

          <View style={styles.sliderRowTextGroup}>
            <Text style={styles.sliderRowTitle}>
              {t('bankAccount:deposit')}
            </Text>
            <TextIcon
              isRtl={isRtl}
              text={AppTimezone.moment(item.depositDate)
                .format(DEFAULT_DATE_FORMAT)}
              textStyle={styles.sliderRowValue}
              iconName="calendar"
              iconSize={14}
              iconColor={colors.white}
            />
          </View>

        </View>

        <View style={[rowStyles, styles.sliderRowLast]}>
          <View style={styles.sliderRowTextGroup}>
            <Text style={styles.sliderRowTitle}>{t(
              'bankAccount:checkNumber')}</Text>
            <Text style={styles.sliderRowValue}>{item.chequeNumber}</Text>
          </View>
        </View>

        <View style={{
          width: width - (IS_IOS ? 40 : 88),
          height: SLIDER_IMG_HEIGHT,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {item.image ? (
            <Image
              style={styles.sliderImg}
              resizeMode="contain"
              source={{ uri: `data:image/jpg;base64,${item.image}` }}
            />
          ) : <Text style={styles.noImageText}>{t(
            'bankAccount:noScanFound')}</Text>}
        </View>
      </Fragment>
    )
  }

  setWidth = (e) => this.setState({ width: e.nativeEvent.layout.width })

  render () {
    const { width, activeSlide } = this.state
    const { cashFlowDetailsDataItem, details, inProgress, parentIsOpen } = this.props
    const data = details || []
    const slideWidth = IS_IOS ? width : width - 48

    const wrapperStyles = cs(cashFlowDetailsDataItem.pictureLink,
      styles.sliderItemWrapper, styles.sliderItemWrapperHasImg)

    return (
      <View
        style={wrapperStyles}
        onLayout={this.setWidth}
      >
        {inProgress ? (
          <LinearGradient
            locations={[0, 0.5, 1]}
            colors={[colors.blue10, colors.blue11, colors.blue12]}
            style={[
              styles.sliderItemGradient,
              {
                width: slideWidth,
                marginHorizontal: IS_IOS ? 0 : 24,
              }]}
          >
            <Loader
              containerStyle={{ backgroundColor: 'transparent' }}
              size="small"
              color={colors.white}
            />
          </LinearGradient>
        ) : parentIsOpen && (
          <Fragment>
            <Carousel
              data={data}
              containerCustomStyle={{ left: IS_IOS ? -28 : -18 }}
              renderItem={this.renderItem}
              onSnapToItem={this.handleSnapToItem}
              sliderWidth={winWidth}
              itemWidth={slideWidth}
            />

            {data.length > 1 && (
              <Pagination
                dotsLength={data.length}
                activeDotIndex={activeSlide}
                containerStyle={styles.sliderPaginationContainer}
                dotStyle={styles.sliderDot}
                inactiveDotStyle={styles.sliderInactiveDot}
                dotContainerStyle={styles.sliderDotContainer}
                inactiveDotOpacity={1}
                inactiveDotScale={1}
              />
            )}
          </Fragment>
        )}
      </View>
    )
  }
}
