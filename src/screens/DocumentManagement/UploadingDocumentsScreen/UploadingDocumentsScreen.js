import React, {Fragment, PureComponent} from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Image,
  Keyboard,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {goTo, goToBack, sp} from '../../../utils/func';
import {
  companyDetailsApi,
  getFoldersApi,
  getUploadUrlApi,
  updateFavoriteApi,
  updateLastUseDateApi,
} from '../../../api';
import {IS_IOS} from '../../../constants/common';
import {KeyboardAwareSectionList} from 'react-native-keyboard-aware-scroll-view';
import {colors, fonts} from '../../../styles/vars';
import Loader from '../../../components/Loader/Loader';
import RowCompany from './components/RowCompany';
import CameraModal from './components/CameraModal';
import Folders from './components/Folders';
import RNFS from 'react-native-fs';
import commonStyles from '../../../styles/styles';
import CustomIcon from '../../../components/Icons/Fontello';
import styles from './UploadingDocumentsStyles';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import {setOpenedBottomSheet} from '../../../redux/actions/user';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {PDFDocument} from 'pdf-lib';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import {selectCompany} from '../../../redux/actions/company';
import {getAccounts} from '../../../redux/actions/account';
import DeviceInfo from 'react-native-device-info';
import Upload from 'react-native-background-upload';
import {BASE_URL} from '../../../constants/config';

const AnimatedSectionList = Animated.createAnimatedComponent(
  KeyboardAwareSectionList,
);

class ScrollCompWithHeader extends PureComponent {
  static listRef = null;

  componentWillUnmount() {
    ScrollCompWithHeader.listRef = null;
  }

  render() {
    const {children, props, hasData, hasDataSearch, inProgress} = this.props;
    const stickyHeaderIndices = props.stickyHeaderIndices;
    return (
      <ScrollView
        ref={scrollView => {
          if (scrollView) {
            ScrollCompWithHeader.listRef = scrollView;
          }
        }}
        {...this.props.props}
        stickyHeaderIndices={stickyHeaderIndices.map(i => i)}>
        {inProgress && (
          <View
            style={{
              width: '98%',
              flexDirection: 'row-reverse',
              flex: 1,
              alignSelf: 'center',
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
            }}>
            <ActivityIndicator color="#999999" />
          </View>
        )}

        {!inProgress && !hasData && (
          <View
            style={{
              backgroundColor: 'white',
              flex: 1,
              position: 'relative',
              marginTop: 15,
            }}
            contentContainerStyle={[
              {
                flexGrow: 1,
                paddingTop: 0,
                paddingBottom: 0,
              },
            ]}>
            <View style={commonStyles.horizontalCenterContainer}>
              <CustomIcon
                name="no-data"
                size={56}
                color={'#022258'}
                style={{marginTop: 15}}
              />

              <Text
                style={{
                  fontSize: sp(22),
                  marginTop: 15,
                  marginBottom: 18,
                  color: '#022258',
                  textAlign: 'center',
                  fontFamily: fonts.semiBold,
                }}>
                {'לא נמצאו חברות'}
              </Text>
            </View>
          </View>
        )}

        {!inProgress && hasData && !hasDataSearch && (
          <View
            style={{
              backgroundColor: 'white',
              flex: 1,
              position: 'relative',
              marginTop: 15,
            }}
            contentContainerStyle={[
              {
                flexGrow: 1,
                paddingTop: 0,
                paddingBottom: 0,
              },
            ]}>
            <View style={commonStyles.horizontalCenterContainer}>
              <CustomIcon
                name="no-data"
                size={56}
                color={'#022258'}
                style={{marginTop: 15}}
              />

              <Text
                style={{
                  fontSize: sp(22),
                  marginTop: 15,
                  marginBottom: 18,
                  color: '#022258',
                  textAlign: 'center',
                  fontFamily: fonts.semiBold,
                }}>
                {'לא נמצאו חברות לסינון המבוקש'}
              </Text>
            </View>
          </View>
        )}
        {children}
      </ScrollView>
    );
  }
}

@connect(state => ({
  user: state.user,
  currentCompanyId: state.currentCompanyId,
  globalParams: state.globalParams,
}))
@withTranslation()
export default class UploadingDocumentsScreen extends PureComponent {
  inputRef = null;

  constructor(props) {
    super(props);
    this.state = {
      isLessMemory: false,
      isLayoutComplete: false,
      query: null,
      companyDetails: [],
      refreshing: false,
      scrollAnim: new Animated.Value(0),
      inProgress: true,
      fadeAnim: new Animated.Value(0),
      files: {},
      folders: {},
      modalAlert: {
        visible: false,
        children: {
          header: null,
          body: null,
          footer: null,
        },
        funcPressScope: null,
        styleWrap: null,
      },
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    this.getCompanyDetails();
    if (!IS_IOS) {
      DeviceInfo.getMaxMemory().then(res => {
        let isLessMemory = false;
        const bytes = res;
        const decimals = 2;
        if (bytes === 0) {
          isLessMemory = true;
        } else {
          const k = 1024;
          const dm = decimals < 0 ? 0 : decimals;
          // const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          if (i < 2) {
            isLessMemory = true;
          } else if (i > 2) {
            isLessMemory = false;
          } else if (i === 2) {
            isLessMemory =
              parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) < 350;
          }
        }

        this.setState({isLessMemory: isLessMemory});
      });
    }
  }

  getCompanyDetails = () => {
    this.setState({
      inProgress: true,
    });
    companyDetailsApi
      .get()
      .then(companyDetails => {
        console.log(companyDetails);
        const objParamas = this.props.route.params.objParamas;
        if (objParamas) {
          const item = companyDetails.find(
            it => it.companyId === objParamas.companyId,
          );
          if (item) {
            if (objParamas.action === 'openCameraAndCameraRollTrue') {
              this.openCameraAndCameraRoll(item, true)();
            } else if (objParamas.action === 'openCameraAndCameraRollFalse') {
              this.openCameraAndCameraRoll(item, false)();
            } else if (objParamas.action === 'getFolders') {
              this.getFolders(item)();
            }
          }

          this.setState({
            currentOpenItemIndexSlideInside: objParamas.companyId,
          });
          delete this.props.route.params.objParamas;
        }
        this.setState(
          {
            companyDetails,
            inProgress: false,
            isLayoutComplete: true,
          },
          () => {
            this.filterAll();
          },
        );
      })
      .catch(() => {
        this.setState(
          {
            inProgress: false,
            isLayoutComplete: true,
            companyDetails: [],
          },
          () => {
            this.filterAll();
          },
        );
      });
  };

  filterAll = () => {
    const {companyDetails, query} = this.state;
    let dataCompanyDetails = companyDetails;
    if (query !== null && query !== '') {
      dataCompanyDetails = dataCompanyDetails.filter(
        it =>
          (it.companyName &&
            it.companyName
              .toString()
              .toLowerCase()
              .includes(query.toLowerCase())) ||
          (it.companyHp &&
            it.companyHp
              .toString()
              .toLowerCase()
              .includes(query.toLowerCase())),
      );
    }

    const companyDetailsArr = [];
    if (dataCompanyDetails && dataCompanyDetails.length) {
      const favorite = dataCompanyDetails.filter(item => item.favorite);
      if (favorite.length) {
        const isHebrew = favorite
          .filter(it => /[\u0590-\u05FF]/.test(it.companyName))
          .sort((a, b) => (a.companyName > b.companyName ? 1 : -1));
        const isEnglish = favorite
          .filter(it => /^[A-Za-z]+$/.test(it.companyName))
          .sort((a, b) => (a.companyName > b.companyName ? 1 : -1));
        const isNumbers = favorite
          .filter(it => /^[0-9]+$/.test(it.companyName))
          .sort((a, b) => (a.companyName > b.companyName ? 1 : -1));
        const isOthers = favorite
          .filter(
            it =>
              !/^[A-Za-z]+$/.test(it.companyName) &&
              !/^[0-9]+$/.test(it.companyName) &&
              !/[\u0590-\u05FF]/.test(it.companyName),
          )
          .sort((a, b) => (a.companyName > b.companyName ? 1 : -1));
        companyDetailsArr.push({
          title: 'מועדפים',
          data: isHebrew.concat(isEnglish, isNumbers, isOthers),
        });
      }
      const regular = dataCompanyDetails.filter(item => !item.favorite);
      if (regular.length) {
        const isHebrew = regular
          .filter(it => /[\u0590-\u05FF]/.test(it.companyName))
          .sort((a, b) => (a.companyName > b.companyName ? 1 : -1));
        const isEnglish = regular
          .filter(it => /^[A-Za-z]+$/.test(it.companyName))
          .sort((a, b) => (a.companyName > b.companyName ? 1 : -1));
        const isNumbers = regular
          .filter(it => /^[0-9]+$/.test(it.companyName))
          .sort((a, b) => (a.companyName > b.companyName ? 1 : -1));
        const isOthers = regular
          .filter(
            it =>
              !/^[A-Za-z]+$/.test(it.companyName) &&
              !/^[0-9]+$/.test(it.companyName) &&
              !/[\u0590-\u05FF]/.test(it.companyName),
          )
          .sort((a, b) => (a.companyName > b.companyName ? 1 : -1));
        companyDetailsArr.push({
          title: 'חברות',
          data: isHebrew.concat(isEnglish, isNumbers, isOthers),
        });
      }
    }

    this.setState(
      {
        companyDetailsArr,
      },
      () => {
        this.setState({
          refreshing: false,
        });
      },
    );
  };

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    this.inputRef = null;
  }

  handleBackPress = () => {
    if (this.state.cameraModalOpen) {
      this.closeCameraAndCameraRoll();
    } else {
      this.props.dispatch(setOpenedBottomSheet(false));
      goToBack(this.props.navigation);
    }
    return true;
  };

  renderFakeHeaderTop = () => {
    return (
      <Animated.View
        style={{
          flex: 1,
          height: 0,
          backgroundColor: 'transparent',
        }}
      />
    );
  };

  handleScrollEnd = e => {
    this.setState({currentScrollPosition: e.nativeEvent.contentOffset.y});
    Keyboard.dismiss();
  };

  _onRefresh = () => {
    this.setState({refreshing: true});
    this.getCompanyDetails();
  };

  handleItemToggle = item => () => {
    const {dispatch} = this.props;
    const {currentOpenItemIndexSlideInside} = this.state;
    this.setState({
      currentOpenItemIndexSlideInside:
        currentOpenItemIndexSlideInside === item.companyId
          ? null
          : item.companyId,
    });

    return dispatch(selectCompany(item.companyId))
      .then(() => dispatch(getAccounts()))
      .then(() => {});
  };

  renderScrollItem = ({item}) => {
    const {currentOpenItemIndexSlideInside, companyDetails} = this.state;

    return (
      <RowCompany
        getFolders={this.getFolders}
        oneRow={companyDetails && companyDetails.length === 1}
        openCameraAndCameraRoll={this.openCameraAndCameraRoll}
        updateFavorite={this.updateFavorite}
        isOpen={currentOpenItemIndexSlideInside === item.companyId}
        onItemToggle={this.handleItemToggle(item)}
        item={item}
      />
    );
  };
  renderDataSectionHeader = ({section}) => {
    return (
      <View
        style={{
          flex: 1,
          height: 48.5,
          flexDirection: 'row-reverse',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}>
        <View
          style={{
            flex: 26.5,
          }}
        />

        <View
          style={{
            borderBottomColor: '#cdcdcd',
            borderBottomWidth: 1,
            flex: 319.5,
            height: 48.5,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}>
          <Text
            style={{
              paddingHorizontal: 6,
              fontSize: sp(18),
              color: '#022258',
              fontFamily: fonts.semiBold,
              paddingBottom: 6.5,
            }}>
            {section.title}
          </Text>
        </View>
      </View>
    );
  };

  handleChangeQuery = query => {
    console.log(query);
    this.setState({query: query}, () => {
      this.filterAll();
    });
  };

  handleSearch = () => {
    const {query} = this.state;
    this.setState({query}, () => {
      if (!query || (query && query.length !== 1)) {
        this.filterAll();
      }
    });
  };

  containerTouched = () => {
    if (this.inputRef && this.inputRef.blur) {
      this.inputRef.blur();
    }
    return false;
  };
  handleSetRef = ref => {
    this.inputRef = ref;
  };
  handleCloseKeyboard = () => {
    Keyboard.dismiss();
  };

  updateFavorite = item => () => {
    const {companyDetails} = this.state;
    const companyDetailsEdit = JSON.parse(JSON.stringify(companyDetails));
    item.favorite = !item.favorite;
    console.log(item);
    companyDetailsEdit.find(it => it.companyId === item.companyId).favorite =
      item.favorite;
    this.setState(
      {
        refreshing: true,
        companyDetails: companyDetailsEdit,
      },
      () => {
        this.filterAll();
        updateFavoriteApi
          .post({
            body: {
              companyId: item.companyId,
              favorite: item.favorite,
            },
          })
          .then(res => {})
          .catch(() => {});
      },
    );
  };

  openCameraAndCameraRoll = (item, isExpense, folderItem) => () => {
    this.setState({
      cameraModalOpen: {
        folderItem: folderItem || false,
        item,
        isExpense,
      },
    });
  };

  closeCameraAndCameraRoll = () => {
    this.setState({
      cameraModalOpen: false,
    });
  };

  closeFolderModal = () => {
    this.setState({
      folders: {},
    });
  };
  renderItemSeparator = () => {
    return (
      <View
        style={{
          flexDirection: 'row-reverse',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          flex: 1,
          height: 1,
        }}>
        <View
          style={{
            flex: 26.5,
          }}
        />

        <View
          style={{
            height: 1,
            backgroundColor: '#cdcdcd',
            flex: 319.5,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}
        />
      </View>
    );
  };

  imageToPdf = images => {
    return new Promise(async resolve => {
      const pdfDoc = await PDFDocument.create();
      for (const file of images) {
        let realUrl = '';
        if (IS_IOS && !file.uri.includes('file://')) {
          realUrl = await this.getAssetFileAbsolutePath(file.uri);
        } else {
          realUrl = file.uri;
        }
        try {
          const uri = await this.resizeImage(realUrl);
          const getBase64 = await RNFS.readFile(uri, 'base64');
          const jpgImage = await pdfDoc.embedJpg(getBase64);
          const jpgDims = jpgImage.scale(1);
          const page = pdfDoc.addPage();

          let outputWidth = jpgDims.width;
          let outputHeight = jpgDims.height;
          const width = page.getWidth();
          const height = page.getHeight();

          if (jpgDims.width > width || jpgDims.height > height) {
            const inputImageAspectRatio = jpgDims.width / jpgDims.height;
            if (jpgDims.width > width) {
              outputWidth = width;
              outputHeight = width / inputImageAspectRatio;
            } else if (jpgDims.height > height) {
              outputHeight = height;
              outputWidth = height * inputImageAspectRatio;
            }
          }
          page.drawImage(jpgImage, {
            x: (width - outputWidth) / 2,
            y: 0,
            width: outputWidth,
            height: outputHeight,
          });
        } catch (err) {
          console.log(err);
        }
      }

      const nameOfFile = `${images[0].name}_${new Date().getTime()}_merge.pdf`;
      const pdfPath = `${RNFS.TemporaryDirectoryPath}${nameOfFile}`;
      const base64DataUri = await pdfDoc.saveAsBase64();
      // console.log(base64DataUri, pdfPath);
      RNFS.writeFile(pdfPath, base64DataUri, 'base64')
        .then(success => {
          console.log('FILE WRITTEN!', pdfPath);
          resolve({
            type: 'application/pdf',
            uri: 'file://' + pdfPath,
            name: nameOfFile,
            parent: true,
            srcFromFolders: false, //important for prevent resize later
          });
        })
        .catch(err => {
          resolve(null);
          console.log(err.message);
        });
    });
  };

  uploadPhotos = async photosSelected => {
    const {companyDetails, cameraModalOpen} = this.state;
    const dataItem = Object.assign({}, cameraModalOpen);
    const modalAlertLoader = Object.assign({}, this.state.modalAlert);
    modalAlertLoader.visible = true;
    modalAlertLoader.funcPressScope = null;
    modalAlertLoader.children = {
      header: null,
      body: () => {
        return (
          <View
            style={{
              flexDirection: 'column',
              width: '100%',
              flex: 1,
            }}>
            <View
              style={{
                height: 100,
              }}>
              <Text
                style={{
                  paddingHorizontal: 20,
                  color: '#022258',
                  fontSize: sp(18),
                  fontFamily: fonts.semiBold,
                  textAlign: 'center',
                  paddingBottom: 10,
                  marginBottom: 10,
                }}>
                {'מעבד קבצים'}
              </Text>

              <ActivityIndicator color="#999999" />
            </View>
          </View>
        );
      },
      footer: null,
    };
    modalAlertLoader.styleWrap = {
      backgroundColor: 'white',
      borderRadius: 8,
      position: 'absolute',
      top: 160,
      right: '50%',
      marginRight: -160,
      height: 150,
      width: 320,
      flexDirection: 'column',
    };
    this.setState({
      modalAlert: modalAlertLoader,
    });
    for (let i = 0; i < photosSelected.length; i++) {
      let file = photosSelected[i];
      if (file.mergeFiles) {
        const pathPdf = await this.imageToPdf(file.mergeFiles);
        console.log(pathPdf);
        if (pathPdf) {
          photosSelected[i] = pathPdf;
        }
      }
    }
    photosSelected = photosSelected.filter(it => it.mergeFiles === undefined);
    console.log('photosSelected', photosSelected);

    let text =
      (photosSelected.length === 1
        ? 'מסמך '
        : photosSelected.length + ' מסמכים') +
      (photosSelected.length === 1 ? 'נשלח' : 'נשלחו') +
      (dataItem && dataItem.folderItem
        ? ' לתיקיית ' + dataItem.folderItem.folderName
        : ' לפיענוח');

    if (companyDetails && companyDetails.length > 1) {
      text =
        (photosSelected.length === 1
          ? 'מסמך '
          : photosSelected.length + ' מסמכים ') +
        'של חברת ' +
        dataItem.item.companyName +
        '\n' +
        (photosSelected.length === 1 ? 'נשלח' : 'נשלחו') +
        (dataItem && dataItem.folderItem
          ? ' לתיקיית ' + dataItem.folderItem.folderName
          : ' לפיענוח');
    }
    modalAlertLoader.visible = false;
    this.setState(
      {
        modalAlert: modalAlertLoader,
        files: {
          companyDetailsItem: dataItem,
          photosSelected,
        },
        cameraModalOpen: false,
      },
      () => {
        const modalAlert = Object.assign({}, this.state.modalAlert);
        modalAlert.visible = true;
        modalAlert.funcPressScope = this.sendPhotos;
        modalAlert.children = {
          header: null,
          body: (
            <Text
              style={{
                paddingHorizontal: 20,
                color: '#022258',
                fontSize: sp(18),
                fontFamily: fonts.semiBold,
                textAlign: 'right',
              }}>
              {text}
            </Text>
          ),
          footer: (
            <View
              style={{
                marginHorizontal: 20,
                height: 45,
                flexDirection: 'row-reverse',
                justifyContent: 'flex-end',
              }}>
              <TouchableOpacity
                onPress={this.closeAlertModal}
                style={{
                  width: 65,
                }}>
                <Text
                  style={{
                    color: '#038ed6',
                    fontSize: sp(18),
                    fontFamily: fonts.semiBold,
                  }}>
                  {'ביטול'}
                </Text>
              </TouchableOpacity>
            </View>
          ),
        };
        modalAlert.styleWrap = {
          backgroundColor: 'white',
          borderRadius: 8,
          position: 'absolute',
          top: 160,
          right: '50%',
          marginRight: -160,
          height: companyDetails && companyDetails.length > 1 ? 150 : 120,
          width: 320,
          flexDirection: 'column',
        };
        this.setState(
          {
            modalAlert,
          },
          () => {
            setTimeout(() => {
              if (
                this.state.modalAlert.visible &&
                !this.state.modalAlert.showCancelAlert
              ) {
                console.log('send');
                this.sendPhotos();
              } else {
                console.log('dont send');
              }
            }, 3000);
          },
        );
      },
    );
  };

  closeAlertModalHandle = () => {
    this.closeAlertModal(true);
  };

  closeAlertModal = dontShowCancelAlert => {
    const {fadeAnim} = this.state;
    const showCancelAlert = dontShowCancelAlert !== true;
    const modalAlert = Object.assign({}, this.state.modalAlert);
    modalAlert.visible = showCancelAlert;
    modalAlert.children = {
      header: null,
      body: !showCancelAlert ? null : (
        <Animated.View
          style={{
            opacity: fadeAnim,
            flexDirection: 'row-reverse',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            height: 40,
            width: 261.5,
            zIndex: 99,
            backgroundColor: '#022258',
            borderRadius: 20,
            marginBottom: 136,
          }}>
          <Text
            style={{
              alignSelf: 'center',
              color: '#ffffff',
              fontSize: sp(16.5),
              fontFamily: fonts.regular,
              textAlign: 'center',
            }}>
            {'השליחה בוטלה'}
          </Text>
        </Animated.View>
      ),
      footer: null,
    };
    modalAlert.showCancelAlert = showCancelAlert;
    modalAlert.funcPressScope = !showCancelAlert
      ? null
      : this.closeAlertModalHandle;
    modalAlert.styleWrap = !showCancelAlert
      ? null
      : {
          position: 'absolute',
          top: '50%',
          right: '50%',
          marginRight: -130.75,
          height: 40,
          width: 261.5,
          flexDirection: 'column',
          marginTop: -20,
        };
    if (showCancelAlert) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            this.closeAlertModal(true);
          });
        }, 3000);
      });
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    this.setState(
      {
        modalAlert,
      },
      () => {},
    );
  };

  dataURLtoFile = (dataUrl, filename, type) => {
    const mime = type;
    // eslint-disable-next-line no-undef
    const bstr = atob(dataUrl);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {
      type: mime,
      lastModified: new Date().getTime(),
      endings: 'endings',
    });
    // return (fetch(dataUrl)
    //   .then(function (res) {
    //     return res.blob()
    //   })
    //   .then(function (buf) {
    //     console.log('buf', buf)
    //
    //     // eslint-disable-next-line no-undef
    //     return new File([buf], filename, { type: type, lastModified: new Date().getTime() })
    //   })
    // )
  };

  getAssetFileAbsolutePath = async assetPath => {
    // console.log("assetPath---------assetPath------assetPath------", assetPath);
    let dest = `${RNFS.TemporaryDirectoryPath}${Math.random()
      .toString(36)
      .substring(7)}.jpg`;
    try {
      let absolutePath = await RNFS.copyAssetsFileIOS(assetPath, dest, 0, 0);
      console.log(absolutePath);
      return absolutePath;
    } catch (err) {
      console.log(err);
    }
  };

  getMimeType = uri => {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open('GET', uri, true);
      req.responseType = 'blob';
      req.onload = function (event) {
        let type = req.response.type;
        if (!type) {
          type = 'image/jpeg';
        }
        resolve(type);
      };
      req.onerror = function (event) {
        resolve('image/jpeg');
      };
      req.send(null);
    });
  };

  resizeImage = urlOrg => {
    return new Promise(resolve => {
      Image.getSize(
        urlOrg,
        (width, height) => {
          const megapixel = Math.round((width * height) / 1024000);
          ImageResizer.createResizedImage(
            urlOrg,
            width,
            height,
            'JPEG',
            megapixel < 6 ? 100 : 98,
            0,
            undefined,
            true,
          )
            .then(({uri}) => {
              resolve(uri);
            })
            .catch(err => {
              console.log(err);
              resolve(urlOrg);
            });
        },
        error => {
          console.log(error);
          resolve(urlOrg);
        },
      );
    });
  };

  sendPhotos = async () => {
    const {files} = this.state;

    if (this.state.modalAlert.visible) {
      console.log('send and close');
      // this.closeAlertModal(true)
    } else {
      console.log('only send');
    }

    const modalAlert = Object.assign({}, this.state.modalAlert);
    modalAlert.visible = true;
    modalAlert.funcPressScope = null;
    modalAlert.children = {
      header: null,
      body: () => {
        return (
          <View
            style={{
              flexDirection: 'column',
              width: '100%',
              flex: 1,
            }}>
            <View
              style={{
                height: 100,
              }}>
              <Text
                style={{
                  paddingHorizontal: 20,
                  color: '#022258',
                  fontSize: sp(18),
                  fontFamily: fonts.semiBold,
                  textAlign: 'center',
                  paddingBottom: 10,
                }}>
                {this.state.statusUpload}
              </Text>

              <ActivityIndicator color="#999999" />
            </View>

            <View
              style={{
                width: '100%',
                height: '100%',
                marginTop: 0,
                marginBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                flex: 1,
              }}>
              <ScrollView keyboardShouldPersistTaps="always">
                {this.state.files.photosSelected.map((c, i) => {
                  return (
                    <View
                      key={i}
                      style={[
                        {
                          paddingHorizontal: 15,
                          height: 65,
                          flexDirection: 'column',
                          flex: 1,
                          width: '100%',
                        },
                      ]}>
                      <View style={styles.bar}>
                        <View
                          style={[
                            styles.fillBar,
                            {
                              backgroundColor: c.error
                                ? '#cd1010'
                                : c.progress >= 100
                                ? '#229f88'
                                : '#022258',
                              borderBottomRightRadius:
                                c.progress >= 100 ? 4 : 0,
                              borderTopRightRadius: c.progress >= 100 ? 4 : 0,
                              width: c.progress ? c.progress + '%' : '0%',
                            },
                          ]}
                        />
                        {!c.error && c.progress >= 100 && (
                          <CustomIcon
                            style={{
                              position: 'absolute',
                              top: 2,
                              left: '48%',
                            }}
                            name={'tick'}
                            size={14}
                            color={'#ffffff'}
                          />
                        )}
                        {c.error && (
                          <Icons
                            style={{
                              position: 'absolute',
                              top: 2,
                              left: '48%',
                            }}
                            name="close"
                            size={14}
                            color={'#ffffff'}
                          />
                        )}
                      </View>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          color: '#022258',
                          fontSize: sp(12),
                          fontFamily: fonts.regular,
                          textAlign: 'center',
                        }}>
                        {c.name}
                      </Text>
                      <Text
                        style={{
                          color: '#022258',
                          fontSize: sp(14),
                          fontFamily: fonts.semiBold,
                          textAlign: 'center',
                        }}>
                        {c.progress ? c.progress : '0'}
                        {'%'}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        );
      },
      footer: null,
    };
    modalAlert.styleWrap = {
      backgroundColor: 'white',
      borderRadius: 8,
      position: 'absolute',
      top: 160,
      right: '50%',
      marginRight: -160,
      height: 440,
      width: 320,
      flexDirection: 'column',
    };
    this.setState({
      modalAlert,
      statusUpload: 'זיהוי נתיב קבצים',
    });

    for (const file of files.photosSelected) {
      let realUrl = '';
      if (
        IS_IOS &&
        !file.uri.includes('file://') &&
        file.type !== 'application/pdf'
      ) {
        realUrl = await this.getAssetFileAbsolutePath(file.uri);
      } else {
        realUrl = file.uri;
      }

      try {
        // const getBase64 = await RNFS.readFile(realUrl, 'base64')
        // console.log(getBase64)
        // const dataUri = 'data:' + file.type + ';base64,' + getBase64

        // const createFile = this.dataURLtoFile(getBase64, file.name, file.type)
        // file.createFile = createFile
        file.type = await this.getMimeType(realUrl);
        file.uri = file.srcFromFolders
          ? await this.resizeImage(realUrl)
          : realUrl;

        // console.log("-------file.uri------", file.uri);

        file.progress = 0;
      } catch (err) {
        console.log(err);
      }
    }
    this.setState({
      statusUpload: 'בקשת כתובות אמזון להעלאת קבצים',
    });
    console.log(files.photosSelected);
    getUploadUrlApi
      .post({
        body: {
          companyId: files.companyDetailsItem.item.companyId,
          files: files.photosSelected.map(item => {
            return {
              fileName: item.name,
              fileType: item.type,
              parent: !!item.parent,
            };
          }),
          folderId: files.companyDetailsItem.folderItem
            ? files.companyDetailsItem.folderItem.folderId
            : null,
          status: files.companyDetailsItem.folderItem
            ? 'ARCHIVE'
            : 'WAIT_FOR_CARE',
          expense: files.companyDetailsItem.folderItem
            ? files.companyDetailsItem.isExpense
            : files.companyDetailsItem.isExpense
            ? 1
            : 0,
          uploadSource: 'MOBILE',
        },
      })
      .then(response => {
        if (files.companyDetailsItem.folderItem) {
          updateLastUseDateApi
            .post({
              body: {
                uuid: files.companyDetailsItem.folderItem.folderId,
              },
            })
            .then(r => {
              console.log(r);
            })
            .catch(error => {
              console.error('Error:', error);
            });
        }
        const urlsFiles = response;
        console.log('responseFiles', urlsFiles);

        this.senderUpload(urlsFiles);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  senderUpload = urlsFiles => {
    const {files} = this.state;
    this.setState({
      statusUpload: 'תהליך העלאת קבצים',
    });
    let completeUpload = 0;
    let completeRun = 0;
    files.photosSelected.forEach((file, index) => {
      const name = file.uri.split('/')[file.uri.split('/').length - 1];
      // console.log("-------file.srcFromFolders------file.srcFromFolders------", file, file.uri);
      const options = {
        url: urlsFiles.links[index].s3UploadUrl,
        path: IS_IOS
          ? file.uri.includes('file://')
            ? file.uri
            : 'file:///' + file.uri
          : file.uri.replace('file://', ''),
        method: 'PUT',
        type: 'raw',
        maxRetries: 2, // set retry count (Android only). Default 2
        headers: {
          'Content-Type': file.type,
        },
        notification: {
          enabled: true,
          autoClear: true,
          onProgressTitle: 'העלאת קובץ',
          onProgressMessage: 'הקובץ ' + name + ' בתהליך העלאה...',
          onCompleteTitle: 'סיום העלאה',
          onCompleteMessage: 'ההעלאת קובץ ' + name + ' הסתיימה בהצלחה',
          onErrorTitle: 'שגיאה',
          onErrorMessage: 'ההעלאת קובץ ' + name + ' נכשלה',
          onCancelledTitle: 'ההעלאה בוטלה',
          onCancelledMessage: 'העלאת קובץ ' + name + ' בוטלה',
        },
        useUtf8Charset: true,
      };
      Upload.startUpload(options)
        .then(uploadId => {
          console.log('Upload started');
          Upload.addListener('progress', uploadId, data => {
            console.log(`Progress: ${data.progress}%`);
            const filesSave = Object.assign({}, files);
            filesSave.photosSelected[index].progress = Math.round(
              data.progress,
            );
            this.setState({
              files: filesSave,
              statusUpload: 'תהליך העלאת קבצים',
            });
          });
          Upload.addListener('error', uploadId, data => {
            console.log(`Error: ${data.error}%`);
            // const filesSave = Object.assign({}, files)
            // filesSave.photosSelected[index].error = true
            // this.setState({
            //     files: filesSave,
            // })
            // completeRun += 1
            // if (completeRun === files.photosSelected.length) {
            //     console.log(completeUpload === files.photosSelected.length
            //         ? 'Upload completed!'
            //         : 'Upload finished not with complete suc!')
            //     this.setState({
            //         statusUpload: completeUpload === files.photosSelected.length
            //             ? 'הקבצים הועלו בהצלחה!'
            //             : 'חלק מהקבצים לא הועלו בהצלחה!',
            //     }, () => {
            //         setTimeout(() => {
            //             this.closeAlertModal(true)
            //         }, 500)
            //     })
            //     if (files.companyDetailsItem.folderItem) {
            //         this.getFolders(files.companyDetailsItem.item)()
            //     }
            // }
            errorUpload(options);
          });
          Upload.addListener('cancelled', uploadId, data => {
            console.log('Cancelled!');
            const filesSave = Object.assign({}, files);
            filesSave.photosSelected[index].error = true;
            this.setState({
              files: filesSave,
            });
            completeRun += 1;
            if (completeRun === files.photosSelected.length) {
              console.log(
                completeUpload === files.photosSelected.length
                  ? 'Upload completed!'
                  : 'Upload finished not with complete suc!',
              );
              this.setState(
                {
                  statusUpload:
                    completeUpload === files.photosSelected.length
                      ? 'הקבצים הועלו בהצלחה!'
                      : 'חלק מהקבצים לא הועלו בהצלחה!',
                },
                () => {
                  setTimeout(() => {
                    this.closeAlertModal(true);
                  }, 500);
                },
              );
              if (files.companyDetailsItem.folderItem) {
                this.getFolders(files.companyDetailsItem.item)();
              }
            }
          });
          Upload.addListener('completed', uploadId, data => {
            // data includes responseCode: number and responseBody: Object
            console.log('Completed!');
            console.log('Upload finished successfully.');
            completeUpload += 1;
            completeRun += 1;
            if (completeRun === files.photosSelected.length) {
              console.log(
                completeUpload === files.photosSelected.length
                  ? 'Upload completed!'
                  : 'Upload finished not with complete suc!',
              );
              this.setState(
                {
                  statusUpload:
                    completeUpload === files.photosSelected.length
                      ? 'הקבצים הועלו בהצלחה!'
                      : 'חלק מהקבצים לא הועלו בהצלחה!',
                },
                () => {
                  setTimeout(() => {
                    this.closeAlertModal(true);
                  }, 500);
                },
              );
              if (files.companyDetailsItem.folderItem) {
                this.getFolders(files.companyDetailsItem.item)();
              }
            }
          });
        })
        .catch(err => {
          console.log('Upload error!', err);
          errorUpload(options);
          // const filesSave = Object.assign({}, files)
          // filesSave.photosSelected[index].error = true
          // this.setState({
          //     files: filesSave,
          // })
          // completeRun += 1
          // if (completeRun === files.photosSelected.length) {
          //     console.log(completeUpload === files.photosSelected.length
          //         ? 'Upload completed!'
          //         : 'Upload finished not with complete suc!')
          //     this.setState({
          //         statusUpload: completeUpload === files.photosSelected.length
          //             ? 'הקבצים הועלו בהצלחה!'
          //             : 'חלק מהקבצים לא הועלו בהצלחה!',
          //     }, () => {
          //         setTimeout(() => {
          //             this.closeAlertModal(true)
          //         }, 500)
          //     })
          //     if (files.companyDetailsItem.folderItem) {
          //         this.getFolders(files.companyDetailsItem.item)()
          //     }
          // }
        });

      // eslint-disable-next-line no-shadow
      function errorUpload(options) {
        options.url = `${BASE_URL}/ocr/upload-workaround/${urlsFiles.links[index].workaroundUploadUrl}`;
        options.headers['Content-Type'] = 'application/octet-stream';
        Upload.startUpload(options)
          .then(uploadId => {
            console.log('Upload started');
            Upload.addListener('progress', uploadId, data => {
              console.log(`Progress: ${data.progress}%`);
              const filesSave = Object.assign({}, files);
              filesSave.photosSelected[index].progress = Math.round(
                data.progress,
              );
              this.setState({
                files: filesSave,
                statusUpload: 'תהליך העלאת קבצים',
              });
            });
            Upload.addListener('error', uploadId, data => {
              console.log(`Error: ${data.error}%`);
              const filesSave = Object.assign({}, files);
              filesSave.photosSelected[index].error = true;
              this.setState({
                files: filesSave,
              });
              completeRun += 1;
              if (completeRun === files.photosSelected.length) {
                console.log(
                  completeUpload === files.photosSelected.length
                    ? 'Upload completed!'
                    : 'Upload finished not with complete suc!',
                );
                this.setState(
                  {
                    statusUpload:
                      completeUpload === files.photosSelected.length
                        ? 'הקבצים הועלו בהצלחה!'
                        : 'חלק מהקבצים לא הועלו בהצלחה!',
                  },
                  () => {
                    setTimeout(() => {
                      this.closeAlertModal(true);
                    }, 500);
                  },
                );
                if (files.companyDetailsItem.folderItem) {
                  this.getFolders(files.companyDetailsItem.item)();
                }
              }
            });
            Upload.addListener('cancelled', uploadId, data => {
              console.log('Cancelled!');
              const filesSave = Object.assign({}, files);
              filesSave.photosSelected[index].error = true;
              this.setState({
                files: filesSave,
              });
              completeRun += 1;
              if (completeRun === files.photosSelected.length) {
                console.log(
                  completeUpload === files.photosSelected.length
                    ? 'Upload completed!'
                    : 'Upload finished not with complete suc!',
                );
                this.setState(
                  {
                    statusUpload:
                      completeUpload === files.photosSelected.length
                        ? 'הקבצים הועלו בהצלחה!'
                        : 'חלק מהקבצים לא הועלו בהצלחה!',
                  },
                  () => {
                    setTimeout(() => {
                      this.closeAlertModal(true);
                    }, 500);
                  },
                );
                if (files.companyDetailsItem.folderItem) {
                  this.getFolders(files.companyDetailsItem.item)();
                }
              }
            });
            Upload.addListener('completed', uploadId, data => {
              // data includes responseCode: number and responseBody: Object
              console.log('Completed!');
              console.log('Upload finished successfully.');
              completeUpload += 1;
              completeRun += 1;
              if (completeRun === files.photosSelected.length) {
                console.log(
                  completeUpload === files.photosSelected.length
                    ? 'Upload completed!'
                    : 'Upload finished not with complete suc!',
                );
                this.setState(
                  {
                    statusUpload:
                      completeUpload === files.photosSelected.length
                        ? 'הקבצים הועלו בהצלחה!'
                        : 'חלק מהקבצים לא הועלו בהצלחה!',
                  },
                  () => {
                    setTimeout(() => {
                      this.closeAlertModal(true);
                    }, 500);
                  },
                );
                if (files.companyDetailsItem.folderItem) {
                  this.getFolders(files.companyDetailsItem.item)();
                }
              }
            });
          })
          .catch(err => {
            console.log('Upload error!', err);
            const filesSave = Object.assign({}, files);
            filesSave.photosSelected[index].error = true;
            this.setState({
              files: filesSave,
            });
            completeRun += 1;
            if (completeRun === files.photosSelected.length) {
              console.log(
                completeUpload === files.photosSelected.length
                  ? 'Upload completed!'
                  : 'Upload finished not with complete suc!',
              );
              this.setState(
                {
                  statusUpload:
                    completeUpload === files.photosSelected.length
                      ? 'הקבצים הועלו בהצלחה!'
                      : 'חלק מהקבצים לא הועלו בהצלחה!',
                },
                () => {
                  setTimeout(() => {
                    this.closeAlertModal(true);
                  }, 500);
                },
              );
              if (files.companyDetailsItem.folderItem) {
                this.getFolders(files.companyDetailsItem.item)();
              }
            }
          });
      }

      // let xhr = new XMLHttpRequest()
      // xhr.open('PUT', urlsFiles[index])
      // xhr.setRequestHeader('Content-Type', file.type)
      // xhr.upload.onload = function () {
      //     console.log('Upload finished successfully.')
      // }
      // xhr.upload.onerror = function () {
      //     console.log(`Error during the upload: ${xhr.status}`)
      // }
      // xhr.upload.onprogress = p => {
      //     const filesSave = Object.assign({}, files)
      //     filesSave.photosSelected[index].progress = Math.round(
      //         (p.loaded / p.total) * 100)
      //     this.setState({
      //         files: filesSave,
      //         statusUpload: 'תהליך העלאת קבצים',
      //     })
      // }
      // xhr.onreadystatechange = () => {
      //     if (xhr.readyState !== 4) {
      //         return
      //     }
      //     if (xhr.status === 200) {
      //         completeUpload += 1
      //         console.log(xhr.status)
      //     } else {
      //         const filesSave = Object.assign({}, files)
      //         filesSave.photosSelected[index].error = true
      //         this.setState({
      //             files: filesSave,
      //         })
      //         console.log('HTTP error', xhr.status, xhr.statusText)
      //     }
      //         completeRun += 1
      //
      //     if (completeRun === files.photosSelected.length) {
      //         console.log(completeUpload === files.photosSelected.length
      //             ? 'Upload completed!'
      //             : 'Upload finished not with complete suc!')
      //         this.setState({
      //             statusUpload: completeUpload === files.photosSelected.length
      //                 ? 'הקבצים הועלו בהצלחה!'
      //                 : 'חלק מהקבצים לא הועלו בהצלחה!',
      //         }, () => {
      //             setTimeout(() => {
      //                 this.closeAlertModal(true)
      //             }, 500)
      //         })
      //         if (files.companyDetailsItem.folderItem) {
      //             this.getFolders(files.companyDetailsItem.item)()
      //         }
      //     }
      // }
      // xhr.send({
      //     uri: file.uri,
      //     type: file.type,
      //     name: file.name,
      // })
      // xhr.send(file.createFile)
    });
  };

  getFolders = companyDetailsItem => () => {
    this.setState(
      {
        folders: {
          companyDetailsItem,
        },
      },
      () => {
        getFoldersApi
          .post({
            body: {
              uuid: companyDetailsItem.companyId,
            },
          })
          .then(folders => {
            console.log(folders);
            const foldersState = Object.assign({}, this.state.folders);
            foldersState.folders = folders;
            this.setState({
              folders: foldersState,
            });
          })
          .catch(error => {
            console.log(error);
          });
      },
    );
  };

  createFolder = () => {};

  linkToLanding = () => {
    const {navigation} = this.props;
    goTo(navigation, 'LANDING');
  };

  render() {
    const {user} = this.props;
    const {
      companyDetails,
      companyDetailsArr,
      refreshing,
      query,
      isLayoutComplete,
      inProgress,
      cameraModalOpen,
      isLessMemory,
      modalAlert,
      folders,
    } = this.state;
    if (!isLayoutComplete) {
      return <Loader overlay containerStyle={{backgroundColor: 'white'}} />;
    }
    StatusBar.setBarStyle(IS_IOS ? 'dark-content' : 'light-content', true);

    return (
      <Fragment>
        <SafeAreaView
          onStartShouldSetResponder={this.containerTouched}
          style={{
            flex: 1,
            position: 'relative',
            flexGrow: 1,
            flexDirection: 'column',
            backgroundColor: 'white',
          }}>
          <View
            style={{
              height: 42.5,
              flexDirection: 'row',
              justifyContent: 'center',
              marginHorizontal: 22.5,
            }}>
            <Text
              style={{
                textAlign: 'center',
                alignSelf: 'center',
                color: '#022258',
                fontSize: sp(24),
                fontFamily: fonts.semiBold,
              }}>
              שליחת מסמכים
            </Text>
          </View>
          {companyDetails && companyDetails.length > 1 && (
            <View
              style={{
                height: 28,
                marginHorizontal: 22.5,
                flexDirection: 'row-reverse',
                borderBottomColor: '#022258',
                borderBottomWidth: 1,
              }}>
              <TextInput
                ref={this.handleSetRef}
                blurOnSubmit
                onBlur={this.handleCloseKeyboard}
                onEndEditing={this.handleCloseKeyboard}
                autoCorrect={false}
                autoCapitalize="sentences"
                returnKeyType="search"
                keyboardType="default"
                style={[
                  {
                    direction: 'ltr',
                    textAlign: 'right',
                    flex: 1,
                    height: 28,
                    fontSize: sp(14),
                    color: colors.blue32,
                    fontFamily: fonts.regular,
                    paddingVertical: 1,
                    paddingHorizontal: 5,
                  },
                ]}
                placeholder={'הקלידו שם חברה/ח.פ'}
                placeholderTextColor={'#cac9c9'}
                value={query}
                multiline={false}
                onChangeText={this.handleChangeQuery}
                onSubmitEditing={this.handleSearch}
                underlineColorAndroid="rgba(0,0,0,0)"
              />
              <Image
                style={{
                  width: 21,
                  height: 21,
                }}
                source={require('BiziboxUI/assets/searchIcon.png')}
              />
            </View>
          )}

          <AnimatedSectionList
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this._onRefresh}
              />
            }
            extraData={refreshing}
            renderScrollComponent={props => (
              <ScrollCompWithHeader
                props={props}
                propsPage={this.props}
                inProgress={inProgress && !refreshing}
                hasData={companyDetails && companyDetails.length > 0}
                hasDataSearch={
                  companyDetails &&
                  companyDetails.length > 0 &&
                  companyDetailsArr &&
                  companyDetailsArr.length > 0
                }
              />
            )}
            bounces
            bouncesZoom
            enableOnAndroid={false}
            removeClippedSubviews={
              IS_IOS && companyDetailsArr && companyDetailsArr.length > 1
            }
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEnabled
            style={[
              {
                position: 'relative',
              },
            ]}
            contentContainerStyle={[
              {
                backgroundColor: '#ffffff',
                paddingTop: 0,
                marginHorizontal: 22.5,
              },
            ]}
            ListHeaderComponent={this.renderFakeHeaderTop}
            scrollEventThrottle={IS_IOS ? 16 : 1}
            sections={
              companyDetailsArr && companyDetailsArr.length > 0
                ? companyDetailsArr
                : []
            }
            renderItem={this.renderScrollItem}
            renderSectionHeader={
              companyDetails && companyDetails.length === 1
                ? null
                : this.renderDataSectionHeader
            }
            ItemSeparatorComponent={null}
            keyExtractor={(item, i) => `${item.companyId}_${i}`}
            initialNumToRender={55}
            windowSize={5}
          />

          {this.props.globalParams.ocrPilot !== undefined &&
            this.props.globalParams.ocrPilot === 1 && (
              <Fragment>
                {companyDetails && companyDetails.length > 1 && (
                  <TouchableOpacity
                    onPress={this.linkToLanding}
                    style={{
                      height: 53.5,
                      paddingHorizontal: 22.5,
                      flexDirection: 'row-reverse',
                      backgroundColor: '#d5edf7',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Image
                      style={{
                        width: 29,
                        height: 29,
                      }}
                      source={require('BiziboxUI/assets/diamond_right.png')}
                    />

                    <View
                      style={{
                        flexDirection: 'row-reverse',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: sp(18),
                          color: '#141414',
                          fontFamily: fonts.bold,
                        }}>
                        {'תזרים מזומנים'}
                      </Text>

                      <Text
                        style={{
                          fontSize: sp(18),
                          color: '#141414',
                          fontFamily: fonts.semiBold,
                        }}>
                        {' אוטומטי לעסק שלכם! '}
                      </Text>

                      <IconFontAwesome
                        name="angle-double-left"
                        size={sp(16)}
                        color={'#141414'}
                        style={{
                          marginRight: 5,
                        }}
                      />
                    </View>

                    <Image
                      style={{
                        width: 29,
                        height: 29,
                      }}
                      source={require('BiziboxUI/assets/diamond_left.png')}
                    />
                  </TouchableOpacity>
                )}
                {companyDetails && companyDetails.length === 1 && (
                  <TouchableOpacity
                    onPress={this.linkToLanding}
                    style={{
                      height: 157,
                      marginBottom: 34,
                      paddingHorizontal: 22.5,
                      flexDirection: 'column',
                      backgroundColor: '#d5edf7',
                      paddingVertical: 15,
                    }}>
                    <Text
                      style={{
                        fontSize: sp(30),
                        color: '#141414',
                        fontFamily: fonts.bold,
                        textAlign: 'center',
                      }}>
                      {'הצטרפו לאלפי בעלי עסקים'}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row-reverse',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: sp(22.5),
                          color: '#141414',
                          fontFamily: fonts.semiBold,
                        }}>
                        {'שלקחו שליטה על'}
                      </Text>

                      <Text
                        style={{
                          fontSize: sp(23.5),
                          color: '#141414',
                          fontFamily: fonts.bold,
                        }}>
                        {' ניהול התזרים '}
                      </Text>

                      <Text
                        style={{
                          fontSize: sp(22.5),
                          color: '#141414',
                          fontFamily: fonts.semiBold,
                        }}>
                        {' שלהם!'}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row-reverse',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: 20,
                      }}>
                      <Image
                        style={{
                          width: 29,
                          height: 29,
                        }}
                        source={require('BiziboxUI/assets/diamond_right.png')}
                      />

                      <View
                        style={{
                          backgroundColor: '#022258',
                          height: 33,
                          width: 208,
                          borderRadius: 4,
                          flexDirection: 'row-reverse',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            fontSize: sp(17.5),
                            color: '#ffffff',
                            fontFamily: fonts.semiBold,
                            textAlign: 'center',
                          }}>
                          {'השארת פרטים'}
                        </Text>
                      </View>

                      <Image
                        style={{
                          width: 29,
                          height: 29,
                        }}
                        source={require('BiziboxUI/assets/diamond_left.png')}
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </Fragment>
            )}
        </SafeAreaView>

        {cameraModalOpen && (
          <CameraModal
            isLessMemory={isLessMemory}
            uploadPhotos={this.uploadPhotos}
            closeCameraAndCameraRoll={this.closeCameraAndCameraRoll}
          />
        )}
        {folders && folders.companyDetailsItem !== undefined && (
          <Folders
            createFolder={this.createFolder}
            getFolders={this.getFolders}
            closeFolderModal={this.closeFolderModal}
            folders={folders}
            openCameraAndCameraRoll={this.openCameraAndCameraRoll}
          />
        )}
        <Modal
          animationType="none"
          transparent
          visible={modalAlert && modalAlert.visible}>
          <TouchableOpacity
            activeOpacity={modalAlert.funcPressScope ? 0.9 : 1}
            onPress={modalAlert.funcPressScope}
            style={{
              flex: 1,
              backgroundColor: modalAlert.showCancelAlert
                ? 'transparent'
                : 'rgba(0,0,0,0.75)',
            }}>
            <TouchableOpacity
              style={modalAlert.styleWrap ? modalAlert.styleWrap : {}}
              onPress={null}
              activeOpacity={1}>
              {modalAlert.children.header}

              <View
                style={{
                  flex: 1,
                  flexDirection: 'row-reverse',
                  justifyContent: 'flex-start',
                  marginTop: 20,
                }}>
                {modalAlert.children.body
                  ? typeof modalAlert.children.body === 'function'
                    ? modalAlert.children.body()
                    : modalAlert.children.body
                  : null}
              </View>

              {modalAlert.children.footer}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </Fragment>
    );
  }
}
