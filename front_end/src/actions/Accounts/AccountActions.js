import fetch from 'isomorphic-fetch';

let apiUrl;
if (typeof __DEVELOPMENT__ !== 'undefined' && __DEVELOPMENT__ === true) {
  apiUrl = __DEVAPI__;
} else {
  apiUrl = __LIVEAPI__;
}

export const REQUEST_ADD_ACCOUNT = 'REQUEST_ADD_ACCOUNT';
export const RECEIVE_ADD_ACCOUNT = 'RECEIVE_ADD_ACCOUNT';

export const REQUEST_ACCOUNTS = 'REQUEST_ACCOUNTS';
export const RECEIVE_ACCOUNTS = 'RECEIVE_ACCOUNTS';

export const REQUEST_ACCOUNT = 'REQUEST_ACCOUNT_VIEW';
export const RECEIVE_ACCOUNT = 'RECEIVE_ACCOUNT_VIEW';

export function requestAddAccount() {
  return {type: REQUEST_ADD_ACCOUNT};
}

export function receiveAddAccount(json) {
  return {type: RECEIVE_ADD_ACCOUNT, json};
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
      .then(response => response.json())
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

export function saveAccount(data) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestAddAccount());
    // Return a promise to wait for
    /*return fetch(apiUrl + '/api/accounts', {
     method: 'post',
     headers: {
     'Accept': 'application/json',
     'Content-Type': 'application/json'
     },
     body: JSON.stringify({
     name: data.text
     })
     }).then(response => response.json())
     .then((json) => {
     dispatch(receiveAddAccount({
     'created_at': '',
     'email': 'test@gmail.com',
     'id': 99,
     'name': data.text,
     'phone': '+1(888)0000000'
     }));
     });*/

    return fetch('http://localhost:9999/public/mock/accounts.json')
      .then(response => response.json())
      .then(() => {
        setTimeout(() => {
          dispatch(receiveAddAccount({
            'created_at': '',
            'email': 'test@gmail.com',
            'id': 99,
            'name': data.text,
            'phone': '+1(888)0000000'
          }));
        }, 1000);
      }
    );
  };
}
