import {applyMiddleware, legacy_createStore as createStore} from 'redux';
// import {legacy_createStore as createStore} from 'redux'
import {persistCombineReducers, persistStore} from 'redux-persist';
import logger from 'redux-logger';
// import storage from 'redux-persist/lib/storage'
import thunk from 'redux-thunk';
import {composeWithDevTools} from '@redux-devtools/extension';
import appReducer from './reducers';
import asyncActionsMiddleware from './middleware/asyncActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {IS_DEV} from '../constants/config';

const storageConfig = {
  timeout: 0,
  key: 'biziboxRootState',
  storage: AsyncStorage,
  whitelist: [
    'isRtl',
    'token',
    'showPopAlertCheck',
    'showPopAlertCash',
    'rememberMe',
    'taryePopupTimes',
    'showPopAlertCreateTrans',
    'mutavimPopupTimes',
  ],
};

const reducer = persistCombineReducers(storageConfig, appReducer);
const middlewares = [thunk, asyncActionsMiddleware];
if (IS_DEV) {
  middlewares.push(logger);
}

export const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(...middlewares)),
);

export const persistor = persistStore(store);
