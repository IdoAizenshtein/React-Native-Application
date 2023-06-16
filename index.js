/**
 * @format
 */

import 'intl';
import 'intl/locale-data/jsonp/en';
import 'intl/locale-data/jsonp/he';
import {
  AppRegistry,
  I18nManager,
  LogBox,
  Text,
  TextInput,
} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

if (!__DEV__) {
  try {
    console = {};
    console.assert = () => {};
    console.info = () => {};
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.time = () => {};
    console.timeEnd = () => {};
    global.console = console;
  } catch (err) {}
}

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps = Text.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

I18nManager.forceRTL(false);
I18nManager.allowRTL(false);
LogBox.ignoreAllLogs(true);
AppRegistry.registerComponent(appName, () => App);
