import fetch from 'isomorphic-fetch';
import tv4 from 'tv4';

export const REQUEST_INIT_DATA = 'REQUEST_INIT_DATA';
export const RECEIVE_INIT_DATA = 'RECEIVE_INIT_DATA';
export const AUTHORING_SELECT_CHANNEL = 'AUTHORING_SELECT_CHANNEL';
export const LOAD_DISTRIBUTION_FILE_START = 'LOAD_DISTRIBUTION_FILE_START'
export const LOAD_DISTRIBUTION_FILE_ERROR = 'LOAD_DISTRIBUTION_FILE_ERROR';
export const LOAD_DISTRIBUTION_FILE_SUCCESS = 'LOAD_DISTRIBUTION_FILE_SUCCESS';

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
  return (dispatch, getState) => {
    var reader = new FileReader();

    reader.onerror = (e) => ({
      type: LOAD_DISTRIBUTION_FILE_ERROR,
      message: 'Error loading file.'
    });

    reader.onload = () => {
      // Parse the file (JSON).
      try {
        var data = JSON.parse(reader.result);
      } catch(e) {
        dispatch((() => ({
          type: LOAD_DISTRIBUTION_FILE_ERROR,
          message: 'Error parsing file. Verify that it is valid JSON.'
        }))());
        return;
      }

      // Validate the schema.
      var distributions = {};
      var assets = {};
      var schema = getState().Authoring.initData.schema;
      if (data.hasOwnProperty('assets')) {
          schema = schema.compact;
          distributions = data.distributions;
          assets = data.assets;
      } else {
          schema = schema.default;
          distributions = data;
      }
      var results = tv4.validateResult(data, schema);

      if (!results.valid) {
        dispatch((() => ({
          type: LOAD_DISTRIBUTION_FILE_ERROR,
          message: 'Validation failed: ' + results.error.message + ' at ' + results.error.dataPath
        }))());
        return;
      }

      // Process the tiles.
      // TODO:!!!

      dispatch((() => ({
        type: LOAD_DISTRIBUTION_FILE_SUCCESS,
        data: data
      }))());

      return;
    };

    dispatch((() => ({type: LOAD_DISTRIBUTION_FILE_START}))());
    reader.readAsText(file);
  };
}
