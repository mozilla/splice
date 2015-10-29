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

export const CAMPAIGN_SET_PAST = 'CAMPAIGN_SET_PAST';
export const CAMPAIGN_SET_SCHEDULED = 'CAMPAIGN_SET_SCHEDULED';
export const CAMPAIGN_SET_IN_FLIGHT = 'CAMPAIGN_SET_IN_FLIGHT';

export function requestCreateCampaign() {
  return {type: REQUEST_CREATE_CAMPAIGN};
}

export function receiveCreateCampaign(json) {
  return {
    type: RECEIVE_CREATE_CAMPAIGN,
    json: json
  };
}

export function requestUpdateCampaign() {
  return {type: REQUEST_UPDATE_CAMPAIGN};
}

export function receiveUpdateCampaign(json) {
  return {
    type: RECEIVE_UPDATE_CAMPAIGN,
    json: json
  };
}

export function requestCampaign() {
  return {type: REQUEST_CAMPAIGN};
}
export function receiveCampaign(json) {
  return {
    type: RECEIVE_CAMPAIGN,
    json: json
  };
}

export function requestCampaigns() {
  return {type: REQUEST_CAMPAIGNS};
}
export function receiveCampaigns(json) {
  return {
    type: RECEIVE_CAMPAIGNS,
    json: json
  };
}

export function campaignSetPast(value) {
  return {
    type: CAMPAIGN_SET_PAST,
    value: value
  };
}
export function campaignSetScheduled(value) {
  return {
    type: CAMPAIGN_SET_SCHEDULED,
    value: value
  };
}
export function campaignSetInFlight(value) {
  return {
    type: CAMPAIGN_SET_IN_FLIGHT,
    value: value
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
      .then(json => new Promise(resolve => {
        dispatch(receiveCreateCampaign(json));
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
      .then(json => new Promise(resolve => {
        dispatch(receiveUpdateCampaign(json));
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
      .then(response => response.json())
      .then(json => new Promise(resolve => {
        dispatch(receiveCampaign(json));
        resolve(json);
      }));
  };
}

export function fetchCampaigns(accountId = null) {
  // thunk middleware knows how to handle functions
  return function next(dispatch, state) {
    dispatch(requestCampaigns());

    const campaign = state().Campaign;

    // Return a promise to wait for
    return fetch(apiUrl + '/api/campaigns' +
        '?account_id=' + accountId +
        '&past=' + campaign.past +
        '&scheduled=' + campaign.scheduled +
        '&in_flight=' + campaign.inFlight
      )
      .then(response => response.json())
      .then(json => new Promise(resolve => {
        dispatch(receiveCampaigns(json));
        resolve(json);
      }));
  };
}