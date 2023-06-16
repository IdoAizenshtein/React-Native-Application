import React, {Fragment, PureComponent} from 'react';
import {withTranslation} from 'react-i18next';
import {ScrollView, Text, View} from 'react-native';
import {sp} from 'src/utils/func';
import {IS_IOS} from '../../../../constants/common';

import DeviceInfo from 'react-native-device-info';
import VersionCheck from 'react-native-version-check';
import {colors, fonts} from '../../../../styles/vars';
import styles from '../../../../components/EditRowModal/EditRowModalStyles';
import moment from 'moment';

export const BUNDLE_ID = DeviceInfo.getBundleId();
export const IS_DEV = BUNDLE_ID.endsWith('dev');
export const VERSION = DeviceInfo.getVersion();
export const getBrand = DeviceInfo.getBrand();
export const getBuildNumber = DeviceInfo.getBuildNumber();
export const getBundleId = DeviceInfo.getBundleId();
export const getDeviceId = DeviceInfo.getDeviceId();
export const getDeviceType = DeviceInfo.getDeviceType();
export const getModel = DeviceInfo.getModel();
export const getSystemName = DeviceInfo.getSystemName();
export const getSystemVersion = DeviceInfo.getSystemVersion();
export const getUniqueId = DeviceInfo.getUniqueIdSync();

@withTranslation()
export default class GeneralTab extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      latestVersion: null,
      getAndroidId: null,
      getApiLevel: null,
      isCameraPresent: null,
      getCarrier: null,
      getCodename: null,
      getDevice: null,
      getDisplay: null,
      getDeviceName: null,
      getDeviceToken: null,
      getFirstInstallTime: null,
      getFreeDiskStorage: null,
      getFreeDiskStorageOld: null,
      getHardware: null,
      getHost: null,
      getIpAddress: null,
      getLastUpdateTime: null,
      getMacAddress: null,
      getManufacturer: null,
      getMaxMemory: null,
      getPhoneNumber: null,
      getPowerState: null,
      getProduct: null,
      getPreviewSdkInt: null,
      getSystemAvailableFeatures: null,
      getTotalDiskCapacity: null,
      getTotalDiskCapacityOld: null,
      getTotalMemory: null,
      getUsedMemory: null,
      getUserAgent: null,
      getBootloader: null,
    };
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  componentDidMount() {
    if (!IS_DEV) {
      VersionCheck.getLatestVersion({
        provider: IS_IOS ? 'appStore' : 'playStore',
        forceUpdate: true,
      }).then(latestVersion => {
        this.setState({latestVersion: latestVersion});
      });
    }
    // console.log('VERSION', VERSION)
    // console.log('getBrand', getBrand)
    // console.log('getBuildNumber', getBuildNumber)
    // console.log('getBundleId', getBundleId)
    // console.log('getDeviceId', getDeviceId)
    // console.log('getDeviceType', getDeviceType)
    // console.log('getModel', getModel)
    // console.log('getSystemName', getSystemName)
    // console.log('getSystemVersion', getSystemVersion)
    // console.log('getUniqueId', getUniqueId)
    if (!IS_IOS) {
      DeviceInfo.getAndroidId().then(res => {
        this.setState({getAndroidId: res});
      });
      DeviceInfo.getApiLevel().then(res => {
        this.setState({getApiLevel: res});
      });

      DeviceInfo.getCarrier().then(res => {
        this.setState({getCarrier: res});
      });
      DeviceInfo.getCodename().then(res => {
        this.setState({getCodename: res});
      });
      DeviceInfo.getDevice().then(res => {
        this.setState({getDevice: res});
      });

      DeviceInfo.getDisplay().then(res => {
        this.setState({getDisplay: res});
      });
      DeviceInfo.getDeviceName().then(res => {
        this.setState({getDeviceName: res});
      });

      DeviceInfo.getFirstInstallTime().then(res => {
        this.setState({getFirstInstallTime: res});
      });
      DeviceInfo.getFreeDiskStorage().then(res => {
        this.setState({getFreeDiskStorage: res});
      });
      DeviceInfo.getFreeDiskStorageOld().then(res => {
        this.setState({getFreeDiskStorageOld: res});
      });
      DeviceInfo.getHardware().then(res => {
        this.setState({getHardware: res});
      });
      DeviceInfo.getHost().then(res => {
        this.setState({getHost: res});
      });
      DeviceInfo.getIpAddress().then(res => {
        this.setState({getIpAddress: res});
      });

      DeviceInfo.getLastUpdateTime().then(res => {
        this.setState({getLastUpdateTime: res});
      });
      DeviceInfo.getMacAddress().then(res => {
        this.setState({getMacAddress: res});
      });
      DeviceInfo.getManufacturer().then(res => {
        this.setState({getManufacturer: res});
      });
      DeviceInfo.getMaxMemory().then(res => {
        this.setState({getMaxMemory: res});

        // let isLessMemory = false;
        // const bytes = res;
        // const decimals = 2;
        // if (bytes === 0) {
        //     isLessMemory = true;
        // } else {
        //     const k = 1024;
        //     const dm = decimals < 0 ? 0 : decimals;
        //     const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        //     const i = Math.floor(Math.log(bytes) / Math.log(k));
        //     if (i < 2) {
        //         isLessMemory = true;
        //     } else if (i > 2) {
        //         isLessMemory = false;
        //     } else if (i === 2) {
        //         isLessMemory = parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) < 400
        //     }
        // }
      });

      DeviceInfo.getPhoneNumber().then(res => {
        this.setState({getPhoneNumber: res});
      });
      DeviceInfo.getPowerState().then(res => {
        this.setState({getPowerState: JSON.stringify(res)});
      });
      DeviceInfo.getProduct().then(res => {
        this.setState({getProduct: res});
      });
      DeviceInfo.getPreviewSdkInt().then(res => {
        this.setState({getPreviewSdkInt: res});
      });
      DeviceInfo.getTotalDiskCapacity().then(res => {
        this.setState({getTotalDiskCapacity: res});
      });
      DeviceInfo.getTotalDiskCapacityOld().then(res => {
        this.setState({getTotalDiskCapacityOld: res});
      });
      DeviceInfo.getTotalMemory().then(res => {
        this.setState({getTotalMemory: res});
      });
      DeviceInfo.getUsedMemory().then(res => {
        this.setState({getUsedMemory: res});
      });
      DeviceInfo.getUserAgent().then(res => {
        this.setState({getUserAgent: res});
      });
    }
  }

  render() {
    const {
      latestVersion,
      getAndroidId,
      getApiLevel,
      isCameraPresent,
      getCarrier,
      getCodename,
      getDevice,
      getDisplay,
      getDeviceName,
      getDeviceToken,
      getFirstInstallTime,
      getFreeDiskStorage,
      getFreeDiskStorageOld,
      getHardware,
      getHost,
      getIpAddress,
      getLastUpdateTime,
      getMacAddress,
      getManufacturer,
      getMaxMemory,
      getPhoneNumber,
      getPowerState,
      getProduct,
      getPreviewSdkInt,
      getSystemAvailableFeatures,
      getTotalDiskCapacity,
      getTotalDiskCapacityOld,
      getTotalMemory,
      getUsedMemory,
      getUserAgent,
      getBootloader,
    } = this.state;
    console.log('this.state', this.state);
    return (
      <ScrollView
        style={[
          styles.accountsContainer,
          {
            flex: 1,
            position: 'relative',
          },
        ]}
        contentContainerStyle={[
          {
            flexGrow: 1,
            paddingTop: 0,
            backgroundColor: '#fff',
            marginTop: 0,
            paddingBottom: 20,
            marginLeft: 10,
            marginRight: 10,
          },
        ]}>
        <View>
          <Text
            style={{
              textAlign: 'center',
              color: colors.blue32,
              fontSize: sp(18),
              fontFamily: fonts.regular,
              paddingBottom: 15,
            }}>
            {'מספר גרסה נוכחית:'} {VERSION}
          </Text>
          {latestVersion && (
            <Text
              style={{
                textAlign: 'center',
                color: colors.blue32,
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}>
              {'מספר גרסת '} {IS_IOS ? 'AppStore' : 'GooglePlay'} {':'}{' '}
              {latestVersion}
            </Text>
          )}
          {!IS_IOS && (
            <Fragment>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getFreeDiskStorage '} {':'}{' '}
                {this.formatBytes(getFreeDiskStorage)}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getFreeDiskStorageOld '} {':'}{' '}
                {this.formatBytes(getFreeDiskStorageOld)}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getMaxMemory '} {':'} {this.formatBytes(getMaxMemory)}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getTotalDiskCapacity '} {':'}{' '}
                {this.formatBytes(getTotalDiskCapacity)}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getTotalDiskCapacityOld '} {':'}{' '}
                {this.formatBytes(getTotalDiskCapacityOld)}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getTotalMemory '} {':'} {this.formatBytes(getTotalMemory)}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'spaceMaxMemory '} {':'}{' '}
                {this.formatBytes(getMaxMemory - getUsedMemory)}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getUsedMemory '} {':'} {this.formatBytes(getUsedMemory)}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getBrand '} {':'} {getBrand}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getBuildNumber '} {':'} {getBuildNumber}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getBundleId '} {':'} {getBundleId}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getDeviceId '} {':'} {getDeviceId}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getDeviceType '} {':'} {getDeviceType}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getModel '} {':'} {getModel}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getSystemName '} {':'} {getSystemName}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getSystemVersion '} {':'} {getSystemVersion}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getUniqueId '} {':'} {getUniqueId}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getAndroidId '} {':'} {getAndroidId}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getApiLevel '} {':'} {getApiLevel}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getCarrier '} {':'} {getCarrier}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getCodename '} {':'} {getCodename}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getDevice '} {':'} {getDevice}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getDisplay '} {':'} {getDisplay}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getDeviceName '} {':'} {getDeviceName}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getFirstInstallTime '} {':'}{' '}
                {moment(getFirstInstallTime).format('DD/MM/YYYY')}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getHardware '} {':'} {getHardware}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getHost '} {':'} {getHost}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getIpAddress '} {':'} {getIpAddress}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getLastUpdateTime '} {':'}{' '}
                {moment(getLastUpdateTime).format('DD/MM/YYYY')}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getMacAddress '} {':'} {getMacAddress}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getManufacturer '} {':'} {getManufacturer}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getPhoneNumber '} {':'} {getPhoneNumber}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getPowerState '} {':'} {getPowerState}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getProduct '} {':'} {getProduct}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getPreviewSdkInt '} {':'} {getPreviewSdkInt}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.blue32,
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>
                {'getUserAgent '} {':'} {getUserAgent}
              </Text>
            </Fragment>
          )}
        </View>
      </ScrollView>
    );
  }
}
