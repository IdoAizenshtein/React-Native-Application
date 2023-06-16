import DeviceInfo from 'react-native-device-info';

export const BUNDLE_ID = DeviceInfo.getBundleId();
export const IS_DEV = BUNDLE_ID.endsWith('dev');

export const HOSTS = {
  devApp: 'http://172.25.101.41:8080',
  dev: 'https://dev-bsecure.bizibox.biz',
  prod: 'https://bsecure.bizibox.biz',
  qa: 'https://qa-adm1.bizibox.biz',
  aws: 'https://aws-bsecure.bizibox.biz:443',
  local: 'http://10.50.0.70:9090',
};

export let HOST = IS_DEV ? HOSTS.dev : HOSTS.prod;
export let BASE_URL = `${HOST}/rest/api/v1`;
export const VERIFICATION_SMS_NUMBER = '0382';

export function setDevModeFunc() {
  HOST = HOSTS.dev;
  BASE_URL = `${HOST}/rest/api/v1`;
}
export function setLocalModeFunc() {
  HOST = HOSTS.local;
  BASE_URL = `${HOST}/rest/api/v1`;
}
export const ALERTS_TRIAL = {
  showAlert: false,
  showPopUp: false,
  showAlertActivated: false,
  showMutavimSheet: false,
  showAlertPopupCompany: false,
  alertTokens: false,
};

export const IS_LIGHT = {
  light: null,
};

export const COMPANY_INFO = {
  biziboxDowngradeDate: false,
  biziboxTrialExpired: false,
  trialBlocked: false,
  trialBlockedPopup: false,
  budgetPopUpType: false,
  budgetExpiredDays: false,
  badgetPopup: false,
  oneAccount: null,
  ocrPilot: null,
};

export const ReCaptchaV3Var = {
  token: null,
  func: null,
};
