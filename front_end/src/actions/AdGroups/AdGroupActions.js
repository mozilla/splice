import fetch from 'isomorphic-fetch';

let apiUrl;
if (typeof __DEVELOPMENT__ !== 'undefined' && __DEVELOPMENT__ === true) {
  apiUrl = __DEVAPI__;
} else {
  apiUrl = __LIVEAPI__;
}

export const REQUEST_ADD_ADGROUP = 'REQUEST_ADD_ADGROUP';
export const RECEIVE_ADD_ADGROUP = 'RECEIVE_ADD_ADGROUP';

export const REQUEST_ADGROUPS = 'REQUEST_ADGROUPS';
export const RECEIVE_ADGROUPS = 'RECEIVE_ADGROUPS';

export const REQUEST_ADGROUP = 'REQUEST_ADGROUP';
export const RECEIVE_ADGROUP = 'RECEIVE_ADGROUP';

export function requestAddAdGroup() {
  return {type: REQUEST_ADD_ADGROUP};
}

export function receiveAddAdGroup(json) {
  return {type: RECEIVE_ADD_ADGROUP, json};
}

export function requestAdGroups() {
  return {type: REQUEST_ADGROUPS};
}
export function receiveAdGroups(json) {
  return {
    type: RECEIVE_ADGROUPS,
    rows: json.results
  };
}

export function requestAdGroup() {
  return {type: REQUEST_ADGROUP};
}
export function receiveAdGroup(json) {
  return {
    type: RECEIVE_ADGROUP,
    details: json.result
  };
}

export function fetchAdGroup(adGroupId) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestAdGroup());
    // Return a promise to wait for
    return fetch(apiUrl + '/api/adgroups/' + adGroupId)
      .then(response => response.json())
      .then(json => new Promise(resolve => {
        dispatch(receiveAdGroup(json));
        resolve();
      }));
  };
}

export function fetchAdGroups(accountId = null) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestAdGroups());
    // Return a promise to wait for
    let params = '';
    if (accountId !== null) {
      params = '?campaign_id=' + accountId;
    }

    return fetch(apiUrl + '/api/adgroups' + params)
      .then(response => response.json())
      .then(json => {
        dispatch(receiveAdGroups(json));
      }
    );
  };
}

export function saveAdGroup(data) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestAddAdGroup());
    // Return a promise to wait for
    /*return fetch(apiUrl + '/api/adgroups', {
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
    return fetch('http://localhost:9999/public/mock/adGroups.json')
      .then(response => response.json())
      .then(() =>
        setTimeout(() => {
          dispatch(receiveAddAdGroup({
            'created_at': '',
            'email': 'test@gmail.com',
            'id': 99,
            'name': data.text,
            'phone': '+1(888)0000000'
          }));
        }, 1000)
    );
  };
}
