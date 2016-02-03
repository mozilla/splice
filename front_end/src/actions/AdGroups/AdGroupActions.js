import fetch from 'isomorphic-fetch';
import { fetchHelper } from 'helpers/FetchHelpers';
import * as config from 'helpers/config';

const apiUrl = config.get('API_URL');

export const REQUEST_CREATE_ADGROUP = 'REQUEST_CREATE_ADGROUP';
export const RECEIVE_CREATE_ADGROUP = 'RECEIVE_CREATE_ADGROUP';

export const REQUEST_UPDATE_ADGROUP = 'REQUEST_UPDATE_ADGROUP';
export const RECEIVE_UPDATE_ADGROUP = 'RECEIVE_UPDATE_ADGROUP';

export const REQUEST_ADGROUPS = 'REQUEST_ADGROUPS';
export const RECEIVE_ADGROUPS = 'RECEIVE_ADGROUPS';

export const REQUEST_ADGROUP = 'REQUEST_ADGROUP';
export const RECEIVE_ADGROUP = 'RECEIVE_ADGROUP';

export const ADGROUP_SET_DETAILS_VAR = 'ADGROUP_SET_DETAILS_VAR';

export function adGroupSetDetailsVar(variable, value){
  return {type: ADGROUP_SET_DETAILS_VAR, variable: variable, value: value};
}

export function requestCreateAdGroup() {
  return {type: REQUEST_CREATE_ADGROUP};
}

export function receiveCreateAdGroup(json) {
  return {
    type: RECEIVE_CREATE_ADGROUP,
    json: json
  };
}

export function requestUpdateAdGroup() {
  return {type: REQUEST_UPDATE_ADGROUP};
}

export function receiveUpdateAdGroup(json) {
  return {
    type: RECEIVE_UPDATE_ADGROUP,
    json: json
  };
}

export function requestAdGroup() {
  return {type: REQUEST_ADGROUP};
}
export function receiveAdGroup(json) {
  return {
    type: RECEIVE_ADGROUP,
    json: json
  };
}

export function requestAdGroups() {
  return {type: REQUEST_ADGROUPS};
}
export function receiveAdGroups(json) {
  return {
    type: RECEIVE_ADGROUPS,
    json: json
  };
}

export function createAdGroup(data) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestCreateAdGroup());
    // Return a promise to wait for
    const url = apiUrl + '/api/adgroups';
    const options = {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: data
    };
    return fetchHelper(url, options, receiveCreateAdGroup, dispatch);
  };
}

export function updateAdGroup(adGroupId, data) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestUpdateAdGroup());
    // Return a promise to wait for
    const url = apiUrl + '/api/adgroups/' + adGroupId;
    const options = {
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: data
    };
    return fetchHelper(url, options, receiveUpdateAdGroup, dispatch);
  };
}

export function fetchAdGroup(adGroupId) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestAdGroup());
    // Return a promise to wait for
    const url = apiUrl + '/api/adgroups/' + adGroupId;
    return fetchHelper(url, null, receiveAdGroup, dispatch);
  };
}

export function fetchAdGroups(campaignId) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestAdGroups());
    // Return a promise to wait for
    const url = apiUrl + '/api/adgroups?campaign_id=' + campaignId;
    return fetchHelper(url, null, receiveAdGroups, dispatch);
  };
}
