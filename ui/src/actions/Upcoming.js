import fetch from 'isomorphic-fetch';
import tv4 from 'tv4';
import { separateTilesTypes } from '../utils/Distributions';

export const UPCOMING_INIT_DATA_START = 'UPCOMING_INIT_DATA_START';
export const UPCOMING_INIT_DATA_SUCCESS = 'UPCOMING_INIT_DATA_SUCCESS';
export const UPCOMING_INIT_DATA_ERROR = 'UPCOMING_INIT_DATA_ERROR';
export const UPCOMING_SELECT_CHANNEL = 'UPCOMING_SELECT_CHANNEL';
export const UPCOMING_SELECT_LOCALE = 'UPCOMING_SELECT_LOCALE';
export const UPCOMING_SELECT_TYPE = 'UPCOMING_SELECT_TYPE';
export const UPCOMING_UNSCHEDULE_START = 'UPCOMING_UNSCHEDULE_START';
export const UPCOMING_UNSCHEDULE_SUCCESS = 'UPCOMING_UNSCHEDULE_SUCCESS';
export const UPCOMING_UNSCHEDULE_ERROR = 'UPCOMING_UNSCHEDULE_ERROR';
export const UPCOMING_LOAD_DISTRIBUTION_START = 'UPCOMING_LOAD_DISTRIBUTION_START'
export const UPCOMING_LOAD_DISTRIBUTION_ERROR = 'UPCOMING_LOAD_DISTRIBUTION_ERROR';
export const UPCOMING_LOAD_DISTRIBUTION_SUCCESS = 'UPCOMING_LOAD_DISTRIBUTION_SUCCESS';

// TODO: refactor for deduplication
function checkStatus(response){
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    throw new Error('HTTP ' + response.status + ' - ' + response.statusText);
  }
}

function fetchInitData(state) {
  return dispatch => {
    dispatch((() => ({
      type: UPCOMING_INIT_DATA_START
    }))());

    return fetch(state.initData.url)
      .then(checkStatus)
      .then(response => response.json())
      .then(json => {
        dispatch((() => ({
          type: UPCOMING_INIT_DATA_SUCCESS,
          env: json.d.env,
          channels: json.d.chans,
          distributions: json.d.dists,
          schema: json.d.schema,
          receivedAt: Date.now()
        }))());
      })
      .catch(error => {
        dispatch((() => ({
          type: UPCOMING_INIT_DATA_ERROR,
          message: 'Initialization failed. Refresh to try again. ' + error
        }))());
      });
  };
}

function shouldFetchInitData(state) {
  if (state.initData.isLoaded || state.initData.isFetching) {
    return false;
  }
  return true;
}

export function fetchInitDataIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchInitData(getState().Upcoming)) {
      return dispatch(fetchInitData(getState().Upcoming));
    } else {
      return dispatch(refreshDistributions());
    }
  };
}

export function selectChannel(channel) {
  return {
    type: UPCOMING_SELECT_CHANNEL,
    channel
  };
}

export function selectLocale(locale) {
  return {
    type: UPCOMING_SELECT_LOCALE,
    locale
  };
}

export function selectType(tileType) {
  return {
    type: UPCOMING_SELECT_TYPE,
    tileType
  };
}

export function unscheduleDistribution(distributionId) {
  return (dispatch, getState) => {
    dispatch((() => ({type: UPCOMING_UNSCHEDULE_START}))());

    var url = getState().Upcoming.distribution.unscheduleUrl;
    url = url + '?' + encodeQueryParams({distId: distributionId});

    return fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(checkStatus)
      .then(response => {
        dispatch(refreshDistributions());
      })
      .catch(error => {
        dispatch((() => ({
          type: UPCOMING_UNSCHEDULE_ERROR,
          message: 'Unscheduling failed. ' + error
        }))());
      });
  };
}

function refreshDistributions() {
  return (dispatch, getState) => {
    return fetch(getState().Upcoming.distribution.refreshUrl)
      .then(checkStatus)
      .then(response => response.json())
      .then(json => {
        dispatch((() => ({
          type: UPCOMING_UNSCHEDULE_SUCCESS,
          distributions: json.d.dists,
          receivedAt: Date.now()
        }))());
      })
      .catch(error => {
        dispatch((() => ({
          type: UPCOMING_UNSCHEDULE_ERROR,
          message: 'Unschedule succeeded but failed to refresh distribtions. ' + error
        }))());
      });
  };
}

export function previewDistribution(distribution) {
  return (dispatch, getState) => {
    dispatch((() => ({type: UPCOMING_LOAD_DISTRIBUTION_START}))());

    return fetch(distribution.url)
      .then(checkStatus)
      .then(response => response.json())
      .then(json => {
        // Validate the schema.
        var distributions = {};
        var assets = {};
        var schema = getState().Upcoming.initData.schema;
        if (json.hasOwnProperty('assets')) {
            schema = schema.compact;
            distributions = json.distributions;
            assets = json.assets;
        } else {
            schema = schema.default;
            distributions = json;
        }
        var results = tv4.validateResult(json, schema);

        if (!results.valid) {
          dispatch((() => ({
            type: UPCOMING_LOAD_DISTRIBUTION_ERROR,
            message: 'Validation failed: ' + results.error.message + ' at ' + results.error.dataPath
          }))());
          return;
        }

        // Process the tiles.
        var tiles = separateTilesTypes(distributions, assets);

        // And that's all folks. Let the World know.
        dispatch((() => ({
          type: UPCOMING_LOAD_DISTRIBUTION_SUCCESS,
          tiles: tiles,
          distribution: distribution
        }))());
      });
  };
}

// TODO: refactor to remove duplication
function encodeQueryParams(params) {
  var ret = [];
  for (var d in params) {
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(params[d]));
  }
  return ret.join('&');
}
