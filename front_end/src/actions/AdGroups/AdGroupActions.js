import fetch from 'isomorphic-fetch';

let apiUrl;
if (typeof __DEVELOPMENT__ !== 'undefined' && __DEVELOPMENT__ === true) {
  apiUrl = __DEVAPI__;
} else {
  apiUrl = __LIVEAPI__;
}

export const REQUEST_CREATE_ADGROUP = 'REQUEST_CREATE_ADGROUP';
export const RECEIVE_CREATE_ADGROUP = 'RECEIVE_CREATE_ADGROUP';

export const REQUEST_ADGROUPS = 'REQUEST_ADGROUPS';
export const RECEIVE_ADGROUPS = 'RECEIVE_ADGROUPS';

export const REQUEST_ADGROUP = 'REQUEST_ADGROUP';
export const RECEIVE_ADGROUP = 'RECEIVE_ADGROUP';

export function requestCreateAdGroup() {
  return {type: REQUEST_CREATE_ADGROUP};
}

export function receiveCreateAdGroup(json) {
  return {
    type: RECEIVE_CREATE_ADGROUP,
    json: json
  };
}

export function requestAdGroup() {
  return {type: REQUEST_ADGROUP};
}
export function receiveAdGroup(json) {
  return {
    type: RECEIVE_ADGROUP,
    details: json
  };
}

export function requestAdGroups() {
  return {type: REQUEST_ADGROUPS};
}
export function receiveAdGroups(json) {
  return {
    type: RECEIVE_ADGROUPS,
    rows: json
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
        dispatch(receiveAdGroup(json.result));
        resolve();
      }));
  };
}

export function fetchAdGroups(campaignId = null) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestAdGroups());
    // Return a promise to wait for
    let params = '';
    if (campaignId !== null) {
      params = '?campaign_id=' + campaignId;
    }

    return fetch(apiUrl + '/api/adgroups' + params)
      .then(response => response.json())
      .then(json => {
        dispatch(receiveAdGroups(json.results));
      }
    );
  };
}

export function createAdGroup(data) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestCreateAdGroup());
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
     dispatch(receiveCreateAccount({
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
          dispatch(receiveCreateAdGroup({
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
