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

export const REQUEST_BULK_UPLOAD = 'REQUEST_BULK_UPLOAD';
export const RECEIVE_BULK_UPLOAD = 'RECEIVE_BULK_UPLOAD';

export const REQUEST_CAMPAIGNS = 'REQUEST_CAMPAIGNS';
export const RECEIVE_CAMPAIGNS = 'RECEIVE_CAMPAIGNS';

export const REQUEST_CAMPAIGN = 'REQUEST_CAMPAIGN';
export const RECEIVE_CAMPAIGN = 'RECEIVE_CAMPAIGN';

export const CAMPAIGN_SET_FILTER = 'CAMPAIGN_SET_FILTER';

export const CAMPAIGN_SET_DETAILS_VAR = 'CAMPAIGN_SET_DETAILS_VAR';

export function campaignSetDetailsVar(variable, value){
  return {type: CAMPAIGN_SET_DETAILS_VAR, variable: variable, value: value};
}

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

export function requestBulkUpload() {
  return {type: REQUEST_BULK_UPLOAD};
}

export function receiveBulkUpload(json) {
  return {
    type: RECEIVE_BULK_UPLOAD,
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

export function campaignSetFilter(variable, value) {
  return {
    type: CAMPAIGN_SET_FILTER,
    variable: variable,
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

export function bulkupload(campaignId, data){
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestBulkUpload());
    // Return a promise to wait for
    return fetch(apiUrl + '/api/campaigns/' + campaignId + '/bulkupload', {
      method: 'post',
      headers: {
        'Accept': 'application/json'
      },
      body: data
    })
      .then(response => response.json())
      .then(json => new Promise(resolve => {
        dispatch(receiveBulkUpload(json));
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

export function fetchCampaigns(accountId = null, past = null, scheduled = null, inFlight = null) {
  // thunk middleware knows how to handle functions
  return function next(dispatch, state) {
    dispatch(requestCampaigns());

    const campaign = state().Campaign;

    let p = past;
    if(p === null){
      p = campaign.filters.past;
    }
    let s = scheduled;
    if(s === null){
      s = campaign.filters.scheduled;
    }
    let i = inFlight;
    if(i === null){
      i = campaign.filters.inFlight;
    }

    // Return a promise to wait for
    return fetch(apiUrl + '/api/campaigns' +
        '?account_id=' + accountId +
        '&past=' + p +
        '&scheduled=' + s +
        '&in_flight=' + i
      )
      .then(response => response.json())
      .then(json => new Promise(resolve => {
        dispatch(receiveCampaigns(json));
        resolve(json);
      }));
  };
}