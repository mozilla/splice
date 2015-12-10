import fetch from 'isomorphic-fetch';
import * as config from 'helpers/config';
import { fetchHelper } from 'helpers/FetchHelpers';

const apiUrl = config.get('API_URL');

export const REQUEST_CREATE_ACCOUNT = 'REQUEST_CREATE_ACCOUNT';
export const RECEIVE_CREATE_ACCOUNT = 'RECEIVE_CREATE_ACCOUNT';

export const REQUEST_UPDATE_ACCOUNT = 'REQUEST_UPDATE_ACCOUNT';
export const RECEIVE_UPDATE_ACCOUNT = 'RECEIVE_UPDATE_ACCOUNT';

export const REQUEST_ACCOUNTS = 'REQUEST_ACCOUNTS';
export const RECEIVE_ACCOUNTS = 'RECEIVE_ACCOUNTS';

export const REQUEST_ACCOUNT = 'REQUEST_ACCOUNT';
export const RECEIVE_ACCOUNT = 'RECEIVE_ACCOUNT';

export const REQUEST_ACCOUNT_STATS = 'REQUEST_ACCOUNT_STATS';
export const RECEIVE_ACCOUNT_STATS = 'RECEIVE_ACCOUNT_STATS';

export function requestCreateAccount() {
  return {type: REQUEST_CREATE_ACCOUNT};
}

export function receiveCreateAccount(json) {
  return {
    type: RECEIVE_CREATE_ACCOUNT,
    json: json
  };
}

export function requestUpdateAccount() {
  return {type: REQUEST_UPDATE_ACCOUNT};
}

export function receiveUpdateAccount(json) {
  return {
    type: RECEIVE_UPDATE_ACCOUNT,
    json: json
  };
}

export function requestAccount() {
  return {type: REQUEST_ACCOUNT};
}
export function receiveAccount(json) {
  return {
    type: RECEIVE_ACCOUNT,
    json: json
  };
}

export function requestAccounts() {
  return {type: REQUEST_ACCOUNTS};
}
export function receiveAccounts(json) {
  return {
    type: RECEIVE_ACCOUNTS,
    json: json
  };
}
export function requestAccountStats() {
  return {type: REQUEST_ACCOUNT_STATS};
}
export function receiveAccountStats(json) {
  return {
    type: RECEIVE_ACCOUNT_STATS,
    json: json
  };
}

export function createAccount(data) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestCreateAccount());
    // Return a promise to wait for
    const url = apiUrl + '/api/accounts';
    const options = {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: data
    };
    return fetchHelper(url, options, receiveCreateAccount, dispatch);
  };
}

export function updateAccount(accountId, data) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestUpdateAccount());
    // Return a promise to wait for
    const url = apiUrl + '/api/accounts/' + accountId;
    const options = {
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: data
    };
    return fetchHelper(url, options, receiveUpdateAccount, dispatch);
  };
}

export function fetchAccount(accountId) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestAccount());
    // Return a promise to wait for
    const url = apiUrl + '/api/accounts/' + accountId;
    return fetchHelper(url, null, receiveAccount, dispatch);
  };
}

export function fetchAccounts() {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestAccounts());
    // Return a promise to wait for
    const url = apiUrl + '/api/accounts';
    return fetchHelper(url, null, receiveAccounts, dispatch);
  };
}

export function fetchAccountStats(params){
  return function next(dispatch){
    dispatch(requestAccountStats());

    let paramString = '';

    _.forOwn(params, function(value, key){
      if(key && value){
        paramString += '&' + key + '=' + value;
      }
    });

    const url = apiUrl + '/api/stats?group_by=account_id' + paramString;
    return fetchHelper(url, null, receiveAccountStats, dispatch);
  };
}
