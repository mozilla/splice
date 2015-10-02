import fetch from 'isomorphic-fetch';

let apiUrl;
if (typeof __DEVELOPMENT__ !== 'undefined' && __DEVELOPMENT__ === true) {
  apiUrl = __DEVAPI__;
} else {
  apiUrl = __LIVEAPI__;
}

export const REQUEST_CREATE_CAMPAIGN = 'REQUEST_CREATE_CAMPAIGN';
export const RECEIVE_CREATE_CAMPAIGN = 'RECEIVE_CREATE_CAMPAIGN';

export const REQUEST_UPDATE_CAMPAIGN = 'REQUEST_UPDATE_CAMPAIGN';
export const RECEIVE_UPDATE_CAMPAIGN = 'RECEIVE_UPDATE_CAMPAIGN';

export const REQUEST_CAMPAIGNS = 'REQUEST_CAMPAIGNS';
export const RECEIVE_CAMPAIGNS = 'RECEIVE_CAMPAIGNS';

export const REQUEST_CAMPAIGN = 'REQUEST_CAMPAIGN';
export const RECEIVE_CAMPAIGN = 'RECEIVE_CAMPAIGN';

export function requestCreateCampaign() {
  return {type: REQUEST_CREATE_CAMPAIGN};
}

export function receiveCreateCampaign() {
  return {type: RECEIVE_CREATE_CAMPAIGN};
}

export function requestUpdateCampaign() {
  return {type: REQUEST_UPDATE_CAMPAIGN};
}

export function receiveUpdateCampaign() {
  return {type: RECEIVE_UPDATE_CAMPAIGN};
}

export function requestCampaign() {
  return {type: REQUEST_CAMPAIGN};
}
export function receiveCampaign(json) {
  return {
    type: RECEIVE_CAMPAIGN,
    details: json
  };
}

export function requestCampaigns() {
  return {type: REQUEST_CAMPAIGNS};
}
export function receiveCampaigns(json) {
  return {
    type: RECEIVE_CAMPAIGNS,
    rows: json
  };
}

export function createCampaign(data) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestCreateCampaign());
    // Return a promise to wait for
    return fetch(apiUrl + '/api/campaigns', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: data
    })
      .then(response => response.json())
      .then((json) => new Promise(resolve => {
        dispatch(receiveCreateCampaign());
        resolve(json);
      })
    );
  };
}

export function updateCampaign(campaignId, data) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestUpdateCampaign());
    // Return a promise to wait for
    return fetch(apiUrl + '/api/campaigns/' + campaignId, {
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: data
    })
      .then(response => response.json())
      .then((json) => new Promise(resolve => {
        dispatch(receiveUpdateCampaign());
        resolve(json);
      })
    );
  };
}

export function fetchCampaign(campaignId) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestCampaign());
    // Return a promise to wait for
    return fetch(apiUrl + '/api/campaigns/' + campaignId)
      .then(function(response) {
        if (response.status >= 400) {
          dispatch(receiveCampaign({}) );
          throw new Error('Bad response from server');
        }
        return response.json();
      })
      .then(json => new Promise(resolve => {
        dispatch(receiveCampaign(json.result));
        resolve();
      }));
  };
}

export function fetchCampaigns(accountId = null) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestCampaigns());
    // Return a promise to wait for
    let params = '';
    if (accountId !== null) {
      params = '?account_id=' + accountId;
    }

    return fetch(apiUrl + '/api/campaigns' + params)
      .then(response => response.json())
      .then(json => {
        dispatch(receiveCampaigns(json.results));
      }
    );
  };
}