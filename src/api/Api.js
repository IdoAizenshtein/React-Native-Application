import qs from 'qs';
import {compile, pathToRegexp} from 'path-to-regexp';
import {BASE_URL} from '../constants/config';
import {store} from '../redux/configureStore';
import {LOGOUT} from '../redux/constants/auth';

// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest

export default class Api {
  constructor(params) {
    this.endpoint = params.endpoint;
    this.secure = params.secure;
  }

  static getToken() {
    return store.getState().token;
  }

  static getJson(responseJson) {
    return responseJson.text().then(text => {
      try {
        return JSON.parse(text);
      } catch (err) {
        if (
          typeof text === 'string' &&
          (text.includes('cardcom') ||
            text.includes('@') ||
            text.includes('tarya'))
        ) {
          return text;
        } else {
          return {};
        }
      }
    });
  }

  getHeaders(headers) {
    let newHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const token = Api.getToken();
    if (token && !this.secure) {
      newHeaders.Authorization = token;
    }
    if (newHeaders) {
      newHeaders = {...newHeaders, ...headers};
    }
    return newHeaders;
  }

  getOptions(method, body, headers) {
    const opts = {
      method,
      headers: this.getHeaders(headers),
    };

    if (body) {
      opts.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    return opts;
  }

  perform(req) {
    return req
      .then(responseJson => {
        if (!responseJson.ok) {
          if ([401].includes(responseJson.status)) {
            if (!responseJson.url.includes('otp/code?code=')) {
              store.dispatch(dispatch => {
                return dispatch({type: LOGOUT});
              });
            }
          }
          let body = null;
          try {
            body = Api.getJson(responseJson);
          } catch (err) {
            throw new Error('NETWORK ERROR');
          }
          return body || responseJson.text();
        }
        return Api.getJson(responseJson);
      })
      .then(response => {
        // console.log('---------response-----', response)

        if (response.error) {
          throw response;
        } else {
          return response;
        }
      });
  }

  getPath(pathParams, query) {
    let url = `${BASE_URL}/${this.endpoint}`;
    const keys = [];
    pathToRegexp(this.endpoint, keys);
    if (keys.length) {
      url = `${BASE_URL}/${compile(this.endpoint)(pathParams)}`;
    }

    if (query) {
      url = `${url}?${qs.stringify(query)}`;
    }
    return url;
  }

  post({body, pathParams, query, headers} = {}) {
    return this.perform(
      fetch(
        this.getPath(pathParams, query),
        this.getOptions('post', body, headers),
      ),
    );
  }

  get({pathParams, query, headers} = {}) {
    return this.perform(
      fetch(
        this.getPath(pathParams, query),
        this.getOptions('get', null, headers),
      ),
    );
  }

  delete(recordUuid) {
    return this.perform(
      fetch(this.getPath(recordUuid), this.getOptions('delete')),
    );
  }

  put({body, pathParams, headers} = {}) {
    return fetch(
      this.getPath(pathParams),
      this.getOptions('put', body, headers),
    );
  }

  patch(recordUuid, body = {}) {
    return this.perform(
      fetch(this.getPath(recordUuid), this.getOptions('patch', body)),
    );
  }
}
