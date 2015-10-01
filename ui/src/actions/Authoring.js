import fetch from 'isomorphic-fetch';

export const REQUEST_INIT_DATA = 'REQUEST_INIT_DATA';
export const RECEIVE_INIT_DATA = 'RECEIVE_INIT_DATA';
export const AUTHORING_SELECT_CHANNEL = 'AUTHORING_SELECT_CHANNEL';
export const LOAD_DISTRIBUTION_FILE = 'LOAD_DISTRIBUTION_FILE'

function requestInitData() {
  return {
    type: REQUEST_INIT_DATA
  };
}

function receiveInitData(data) {
  return {
    type: RECEIVE_INIT_DATA,
    env: data.d.env,
    channels: data.d.chans,
    distributions: data.d.dists,
    schema: data.d.schema,
    receivedAt: Date.now()
  };
}

function fetchInitData(state) {
  return dispatch => {
    dispatch(requestInitData());
    return fetch(state.initData.url)
      .then(response => response.json())
      .then(json => dispatch(receiveInitData(json)));
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
    if (shouldFetchInitData(getState().Authoring)) {
      return dispatch(fetchInitData(getState().Authoring));
    }
  };
}

export function selectChannel(channel) {
  return {
    type: AUTHORING_SELECT_CHANNEL,
    channel
  };
}

export function loadDistributionFile(file) {
  return {
    type: LOAD_DISTRIBUTION_FILE,
    file
  };
}
