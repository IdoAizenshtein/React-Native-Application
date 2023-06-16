import React, { Fragment, PureComponent } from 'react'
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import {
  combineStyles as cs,
  getFormattedValueArray,
  getTransCategoryIcon,
  sp,
} from '../../../utils/func'
import { colors, fonts } from '../../../styles/vars'
import Loader from '../../../components/Loader/Loader'
import AccountIcon from '../../../components/AccountIcon/AccountIcon'
import styles from '../CashFlowStyles'
import { IS_IOS } from '../../../constants/common'
import CustomIcon from 'src/components/Icons/Fontello'
import { Icon } from 'react-native-elements'
import commonStyles from '../../../styles/styles'
import ImgPreviewModal
  from '../../../components/ImgPreviewModal/ImgPreviewModal'

const winWidth = Dimensions.get('window').width

@withTranslation()
export default class CheckTransSlider extends PureComponent {
  state = {
    width: 100,
    activeSlide: 0,
    imgForPreview: null,
  }

  handleSnapToItem = (index) => this.setState({ activeSlide: index })
  handleShowImgPreview = (uri) => () => this.setState({ imgForPreview: uri })

  handleCloseImgPreview = () => this.setState({ imgForPreview: null })
  renderItem = ({ item, index }) => {
    const { bankTrans, details } = this.props
    const data = details || []
    const isShadowCard = (bankTrans.pictureLink ||
      (!bankTrans.pictureLink && data.length > 1))
    return (
      <View
        style={[
          isShadowCard
            ? styles.sliderItemGradient
            : styles.sliderItemGradientNotCard,
          { paddingVertical: bankTrans.pictureLink ? 2 : 10 }]}
      >
        {item
          ? (bankTrans.pictureLink
            ? this.blockWithImg(item, index)
            : this.simpleBlock(item, index))
          : (<Text>Not found</Text>)}
      </View>
    )
  }

  simpleBlock = (item, index) => {
    const { bankTrans, categories, enabledEditCategory, handleOpenCategoriesModal, details } = this.props
    const total = getFormattedValueArray(item.total)
    const numberStyle = bankTrans ? cs(bankTrans.expence, [
      {
        fontFamily: fonts.semiBold,
      }, { color: colors.green4 }], { color: colors.red2 }) : {}
    const data = details || []
    const isEnabled = enabledEditCategory && item.biziboxMutavId !== null

    if (data.length > 1) {
      return (
        <Fragment>
          <View style={{
            paddingHorizontal: 15,
          }}>
            <Text style={styles.panelTitle}>{item.accountMutavName}</Text>
            <Text style={styles.panelSubtitle}>
              <Text style={numberStyle}>{total[0]}</Text>
              <Text style={[
                {
                  color: colors.gray7,
                  fontFamily: fonts.light,
                }]}>.{total[1]}</Text>
            </Text>
            <View style={{
              height: 1,
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              width: '100%',
              backgroundColor: colors.gray30,
            }}/>
          </View>

          <View style={{
            flexDirection: 'row-reverse',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'space-between',
            marginVertical: 8,
            marginHorizontal: 30,
          }}>
            <View style={{
              flexDirection: 'row-reverse',
              flex: 1,
              alignSelf: 'center',
              justifyContent: 'center',
            }}>
              <View style={{
                paddingLeft: 5,
                alignSelf: 'flex-start',
              }}>
                <AccountIcon account={{ bankId: item.bankId }}/>
              </View>
              <View>
                <Text style={{
                  color: '#022258',
                  fontSize: sp(16),
                  fontFamily: fonts.regular,
                  textAlign: 'center',
                }}>{item.accountId}</Text>
                <Text style={{
                  color: '#022258',
                  fontSize: sp(16),
                  fontFamily: fonts.regular,
                  textAlign: 'center',
                }}>{'ח-ן'}</Text>
              </View>
            </View>
            <View style={{
              alignSelf: 'center',
              justifyContent: 'center',
              flex: 1,
            }}>
              <Text style={{
                color: '#022258',
                fontSize: sp(16),
                fontFamily: fonts.regular,
                textAlign: 'center',
              }}>{item.snifId}</Text>
              <Text style={{
                color: '#022258',
                fontSize: sp(16),
                fontFamily: fonts.regular,
                textAlign: 'center',
              }}>{'סניף'}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={(isEnabled) ? 0.2 : 1}
              style={{
                flex: 1,
                alignItems: 'center',
                flexDirection: 'row-reverse',
                alignContent: 'center',
                justifyContent: 'space-between',
                alignSelf: 'center',
              }}
              onPress={isEnabled ? handleOpenCategoriesModal(item, index,
                bankTrans) : null}>

              <View>
                <View style={{
                  height: 20,
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignItems: 'center',
                }}>
                  {categories.find(
                    (cat) => cat.transTypeId === item.transTypeId) && (
                    <CustomIcon
                      name={getTransCategoryIcon(categories.find(
                        (cat) => cat.transTypeId ===
                          item.transTypeId).iconType)}
                      size={18}
                      color={colors.blue7}
                    />
                  )}
                </View>
                <Text style={{
                  color: '#022258',
                  fontSize: sp(16),
                  fontFamily: fonts.regular,
                  textAlign: 'center',
                }}>{categories.find(
                  (cat) => cat.transTypeId === item.transTypeId)
                  ? categories.find(
                    (cat) => cat.transTypeId === item.transTypeId).transTypeName
                  : ''}</Text>

              </View>

              {isEnabled && (
                <Icon name="chevron-left" size={24} color={colors.blue32}
                      style={{
                        alignSelf: 'flex-start',
                      }}/>
              )}
            </TouchableOpacity>
          </View>
        </Fragment>
      )
    } else {
      return (
        <Fragment>
          <View style={{
            marginVertical: 0,
            alignItems: 'center',
            alignContent: 'center',
          }}>
            <Text style={{
              color: '#022258',
              fontSize: sp(18),
              fontFamily: fonts.semiBold,
              textAlign: 'center',
            }}>
              {'פרטי מוטב'}
            </Text>
          </View>

          <View style={{
            flexDirection: 'row-reverse',
            marginVertical: 15,
            alignItems: 'center',
            alignContent: 'center',
          }}>
            <View style={{
              height: 22,
              alignSelf: 'center',
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
            }}>
              <Image style={{
                alignSelf: 'center',
                resizeMode: 'contain',
                width: 19,
                height: 19,
              }}
                     source={require('BiziboxUI/assets/account-circle.png')}/>
            </View>

            <Text style={{
              paddingRight: 6,
              color: '#022258',
              fontSize: sp(16),
              fontFamily: fonts.regular,
              textAlign: 'right',
            }}>
              {item.accountMutavName}
            </Text>
          </View>

          <View style={{
            height: 1,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            width: '100%',
            backgroundColor: colors.gray30,
          }}/>

          {item.bankId && item.accountId && (
            <Fragment>
              <View style={{
                flexDirection: 'row-reverse',
                marginVertical: 15,
                alignItems: 'center',
                alignContent: 'center',
              }}>
                <AccountIcon account={{ bankId: item.bankId }}/>
                <Text style={{
                  paddingRight: 6,
                  color: '#022258',
                  fontSize: sp(16),
                  fontFamily: fonts.regular,
                  textAlign: 'right',
                }}>
                  {item.accountId}
                </Text>
              </View>

              <View style={{
                height: 1,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                width: '100%',
                backgroundColor: colors.gray30,
              }}/>
            </Fragment>
          )}

          {item.snifId && (
            <Fragment>
              <View style={{
                flexDirection: 'row-reverse',
                marginVertical: 15,
                alignItems: 'center',
                alignContent: 'center',
              }}>
                <View style={{
                  height: 20,
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignItems: 'center',
                }}>
                  <CustomIcon name="bank-fees" size={20} color={'#022258'}/>
                </View>

                <Text style={{
                  paddingRight: 6,
                  color: '#022258',
                  fontSize: sp(16),
                  fontFamily: fonts.regular,
                  textAlign: 'right',
                }}>
                  {item.snifId}
                </Text>
              </View>

              <View style={{
                height: 1,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                width: '100%',
                backgroundColor: colors.gray30,
              }}/>
            </Fragment>
          )}

          <TouchableOpacity
            activeOpacity={(isEnabled) ? 0.2 : 1}
            style={{
              flex: 1,
              flexDirection: 'row-reverse',
              marginVertical: 15,
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'space-between',
            }}
            onPress={isEnabled ? handleOpenCategoriesModal(item, index,
              bankTrans) : null}>
            <View style={{
              flexDirection: 'row-reverse',
              alignItems: 'center',
              alignContent: 'center',
            }}>
              {categories.find((cat) => cat.transTypeId === item.transTypeId) &&
              (
                <CustomIcon
                  name={getTransCategoryIcon(categories.find(
                    (cat) => cat.transTypeId === item.transTypeId).iconType)}
                  size={18}
                  color={colors.blue7}
                />
              )}
              <View style={commonStyles.spaceDividerDouble}/>
              <Text
                style={styles.dataRowLevel3Text}>{categories.find(
                (cat) => cat.transTypeId === item.transTypeId)
                ? categories.find(
                  (cat) => cat.transTypeId === item.transTypeId).transTypeName
                : ''}</Text>
            </View>

            {isEnabled && (
              <Icon name="chevron-left" size={24} color={colors.blue32} style={{
                alignSelf: 'flex-start',
              }}/>
            )}
          </TouchableOpacity>
          <View style={{
            height: 1,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            width: '100%',
            backgroundColor: colors.gray30,
          }}/>

        </Fragment>
      )
    }
  }

  blockWithImg = (item, index) => {
    const { t, bankTrans, categories, handleOpenCategoriesModal, details } = this.props
    const data = details || []
    const total = getFormattedValueArray(item.chequeTotal)
    const numberStyle = cs((item.chequeTotal) > 0, [
      {
        fontFamily: fonts.semiBold,
      }, { color: colors.green4 }], { color: colors.red2 })
    const isEnabled = data.length > 1
    console.log(item)
    return (
      <Fragment>

        <View style={{
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          alignItems: 'center',
          alignContent: 'center',
          paddingHorizontal: 20,
          marginVertical: 15,
        }}>
          <View style={{
            flexDirection: 'row-reverse',
            alignItems: 'center',
            alignContent: 'center',
          }}>
            <View style={{
              height: 22,
              alignSelf: 'center',
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
            }}>
              <Image style={{
                alignSelf: 'center',
                resizeMode: 'contain',
                width: 19,
                height: 19,
              }}
                     source={require('BiziboxUI/assets/account-circle.png')}/>
            </View>

            <Text style={{
              paddingRight: 6,
              color: '#022258',
              fontSize: sp(16),
              fontFamily: fonts.regular,
              textAlign: 'right',
            }}>
              {item.accountMutavName ? item.accountMutavName : ''}
            </Text>
          </View>

          <View>
            <Text style={{
              fontSize: sp(20),
            }}>
              <Text style={numberStyle}>{total[0]}</Text>
              <Text style={[
                numberStyle, {
                  fontFamily: fonts.light,
                }]}>.{total[1]}</Text>
            </Text>
          </View>
        </View>
        <View style={{
          borderBottomColor: '#afb0b2',
          borderBottomWidth: 1,
          paddingBottom: 25,
          width: winWidth - 40 - 25,
          alignSelf: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 175,
        }}>
          {item.image ? (
            <TouchableOpacity
              style={{
                width: '100%',
                height: '100%',
              }}
              onPress={this.handleShowImgPreview(
                `data:image/jpg;base64,${item.image}`)}
            >
              <Image
                style={[styles.sliderImg]}
                resizeMode="stretch"
                source={{ uri: `data:image/jpg;base64,${item.image}` }}
              />
            </TouchableOpacity>
          ) : <Text style={styles.noImageText}>{t(
            'bankAccount:noScanFound')}</Text>}
        </View>

        <View style={{
          flexDirection: 'row-reverse',
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'space-between',
          marginVertical: 15,
          marginHorizontal: 15,
        }}>
          <View style={{
            flexDirection: 'row-reverse',
          }}>
            <View style={{
              paddingLeft: 5,
              alignSelf: 'flex-start',
            }}>
              <AccountIcon account={{ bankId: item.chequeBankNumber }}/>
            </View>
            <View>
              <Text style={{
                color: '#022258',
                fontSize: sp(16),
                fontFamily: fonts.regular,
                textAlign: 'center',
              }}>{item.chequeAccountNumber}</Text>
              <Text style={{
                color: '#022258',
                fontSize: sp(16),
                fontFamily: fonts.regular,
                textAlign: 'center',
              }}>{'ח-ן'}</Text>
            </View>
          </View>
          <View style={{
            alignSelf: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{
              color: '#022258',
              fontSize: sp(16),
              fontFamily: fonts.regular,
              textAlign: 'center',
            }}>{item.chequeBranchNumber}</Text>
            <Text style={{
              color: '#022258',
              fontSize: sp(16),
              fontFamily: fonts.regular,
              textAlign: 'center',
            }}>{'סניף'}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={(isEnabled) ? 0.2 : 1}
            style={{
              alignItems: 'center',
              flexDirection: 'row-reverse',
              alignContent: 'center',
              justifyContent: 'space-between',
              alignSelf: 'center',
            }}
            onPress={isEnabled ? handleOpenCategoriesModal(item, index,
              bankTrans, true) : null}>

            <View>
              <View style={{
                height: 20,
                alignSelf: 'center',
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
              }}>
                {categories.find(
                  (cat) => cat.transTypeId === item.transTypeId) && (
                  <CustomIcon
                    name={getTransCategoryIcon(categories.find(
                      (cat) => cat.transTypeId === item.transTypeId).iconType)}
                    size={18}
                    color={colors.blue7}
                  />
                )}
              </View>
              <Text style={{
                color: '#022258',
                fontSize: sp(16),
                fontFamily: fonts.regular,
                textAlign: 'center',
              }}>{categories.find((cat) => cat.transTypeId === item.transTypeId)
                ? categories.find(
                  (cat) => cat.transTypeId === item.transTypeId).transTypeName
                : ''}</Text>
            </View>

            {isEnabled && (
              <Icon name="chevron-left" size={24} color={colors.blue32}
                    style={{
                      alignSelf: 'flex-start',
                    }}/>
            )}
          </TouchableOpacity>
        </View>
      </Fragment>
    )
  }

  render () {
    const { activeSlide, imgForPreview } = this.state
    const { details, inProgress, parentIsOpen, idxCategory, bankTrans } = this.props
    let data = details || []
    const slideWidth = winWidth - 22
    const isShadowCard = (bankTrans.pictureLink ||
      (!bankTrans.pictureLink && data.length > 1))

    return (
      <View>
        {inProgress ? (
          <View
            style={[
              isShadowCard
                ? styles.sliderItemGradient
                : styles.sliderItemGradientNotCard, { width: slideWidth }]}
          >
            <Loader
              isDefault
              containerStyle={{ backgroundColor: 'transparent' }}
              size="small"
              color={'#022258'}
            />
          </View>
        ) : parentIsOpen && (
          <Fragment>
            {data.length > 0 && (
              <Carousel
                firstItem={idxCategory}
                scrollEnabled={data.length > 1}
                inactiveSlideScale={1}
                inactiveSlideShift={0}
                inactiveSlideOpacity={IS_IOS ? 0.7 : 1}
                data={data}
                // containerCustomStyle={[{ left: 0 }]}
                renderItem={this.renderItem}
                onSnapToItem={this.handleSnapToItem}
                sliderWidth={winWidth}
                itemWidth={slideWidth}
              />
            )}

            {data.length === 0 && (
              <Text style={{
                fontSize: sp(16),
                color: colors.blue7,
                paddingTop: 15,
              }}>{'לא נמצא פירוט'}</Text>
            )}

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

        {imgForPreview && (
          <ImgPreviewModal
            isOpen
            image={imgForPreview}
            onClose={this.handleCloseImgPreview}
          />
        )}
      </View>
    )
  }
}
