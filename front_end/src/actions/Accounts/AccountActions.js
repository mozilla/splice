import fetch from 'isomorphic-fetch';

let apiUrl;
if (typeof __DEVELOPMENT__ !== 'undefined' && __DEVELOPMENT__ === true) {
  apiUrl = __DEVAPI__;
} else {
  apiUrl = __LIVEAPI__;
}

export const REQUEST_CREATE_ACCOUNT = 'REQUEST_CREATE_ACCOUNT';
export const RECEIVE_CREATE_ACCOUNT = 'RECEIVE_CREATE_ACCOUNT';

export const REQUEST_ACCOUNTS = 'REQUEST_ACCOUNTS';
export const RECEIVE_ACCOUNTS = 'RECEIVE_ACCOUNTS';

export const REQUEST_ACCOUNT = 'REQUEST_ACCOUNT';
export const RECEIVE_ACCOUNT = 'RECEIVE_ACCOUNT';

export function requestCreateAccount() {
  return {type: REQUEST_CREATE_ACCOUNT};
}

export function receiveCreateAccount(json) {
  return {
    type: RECEIVE_CREATE_ACCOUNT,
    json: json.result
  };
}

export function requestAccounts() {
  return {type: REQUEST_ACCOUNTS};
}
export function receiveAccounts(json) {
  return {
    type: RECEIVE_ACCOUNTS,
    rows: json.results
  };
}

export function requestAccount() {
  return {type: REQUEST_ACCOUNT};
}
export function receiveAccount(json) {
  return {
    type: RECEIVE_ACCOUNT,
    details: json.result
  };
}

export function fetchAccount(accountId) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestAccount());
    // Return a promise to wait for
    //return fetch('http://localhost:9999/public/mock/account_' + accountId + '.json')
    return fetch(apiUrl + '/api/accounts/' + accountId)
      .then(function(response) {
        if (response.status >= 400) {
          throw new Error('Bad response from server');
        }
        return response.json();
      })
      .then(json => new Promise(resolve => {
        dispatch(receiveAccount(json));
        resolve();
      })
    );
  };
}

export function fetchAccounts() {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestAccounts());
    // Return a promise to wait for
    //return fetch('http://localhost:9999/public/mock/accounts.json')
    return fetch(apiUrl + '/api/accounts')
      .then(response => response.json())
      .then(json => {
        dispatch(receiveAccounts(json));
      }
    );
  };
}

export function createAccount(data) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestCreateAccount());
    // Return a promise to wait for
    return fetch(apiUrl + '/api/accounts', {
    //return fetch('http://dev.sandbox.com/receiveFile.php', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: data
    })
    .then(response => response.json())
    .then((json) => new Promise(resolve => {
      dispatch(receiveCreateAccount(json));
        resolve();
      })
    );
  };
}
