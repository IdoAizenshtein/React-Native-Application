/**
 *
 * @format
 * @flow
 */

import React, {PureComponent} from 'react';
import {Provider} from 'react-redux';
import i18n from './src/locales/i18n';
import {I18nextProvider} from 'react-i18next';
import {PersistGate} from 'redux-persist/es/integration/react';
import {persistor, store} from './src/redux/configureStore';
import {AppDrawer} from './src/navigator';
import Loader from './src/components/Loader/Loader';
import './src/locales/calendar';
import GlobalFont from 'react-native-global-font';
export default class App extends PureComponent {
  componentDidMount() {
    GlobalFont.applyGlobal('Assistant-Regular');
  }

  render() {
    return (
      <I18nextProvider i18n={i18n}>
        <Provider store={store}>
          <PersistGate loading={<Loader overlay />} persistor={persistor}>
            <AppDrawer />
          </PersistGate>
        </Provider>
      </I18nextProvider>
    );
  }
}
