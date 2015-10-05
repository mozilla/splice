import fetch from 'isomorphic-fetch';
import tv4 from 'tv4';

export const INIT_DATA_START = 'INIT_DATA_START';
export const INIT_DATA_SUCCESS = 'INIT_DATA_SUCCESS';
export const INIT_DATA_ERROR = 'INIT_DATA_ERROR';
export const AUTHORING_SELECT_CHANNEL = 'AUTHORING_SELECT_CHANNEL';
export const AUTHORING_SELECT_LOCALE = 'AUTHORING_SELECT_LOCALE';
export const AUTHORING_SELECT_TYPE = 'AUTHORING_SELECT_TYPE';
export const LOAD_DISTRIBUTION_FILE_START = 'LOAD_DISTRIBUTION_FILE_START'
export const LOAD_DISTRIBUTION_FILE_ERROR = 'LOAD_DISTRIBUTION_FILE_ERROR';
export const LOAD_DISTRIBUTION_FILE_SUCCESS = 'LOAD_DISTRIBUTION_FILE_SUCCESS';

function requestInitData() {
  return {
    type: INIT_DATA_START
  };
}

function receiveInitData(data) {
  return {
    type: INIT_DATA_SUCCESS,
    env: data.d.env,
    channels: data.d.chans,
    distributions: data.d.dists,
    schema: data.d.schema,
    receivedAt: Date.now()
  };
}

function initDataError(message) {
  return {
    type: INIT_DATA_ERROR,
    message: 'Initialization failed. Refresh to try again. Error: ' + message
  };
}

function fetchInitData(state) {
  return dispatch => {
    dispatch(requestInitData());
    return fetch(state.initData.url)
      .then(function(response){
        if (response.status >= 200 && response.status < 300) {
          response.json().then(json => dispatch(receiveInitData(json)))
        } else {
          dispatch(initDataError(response.statusText));
        }
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

export function selectLocale(locale) {
  return {
    type: AUTHORING_SELECT_LOCALE,
    locale
  };
}

export function selectType(tileType) {
  return {
    type: AUTHORING_SELECT_TYPE,
    tileType
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
      var tiles = separateTilesTypes(distributions, assets);

      // And that's all folks. Let the World know.
      dispatch((() => ({
        type: LOAD_DISTRIBUTION_FILE_SUCCESS,
        tiles: tiles
      }))());
    };

    dispatch((() => ({type: LOAD_DISTRIBUTION_FILE_START}))());
    reader.readAsText(file);
  };
}

function separateTilesTypes(data, assets) {
  // Separate Tiles types from a list of tiles in 2 groups: suggested, directory
  var output = {raw: data, ui: {}};

  for (var locale in output.raw) {
    let tiles = data[locale];

    output.ui[locale] = {
      suggestedTiles: [],
      directoryTiles: []
    };

    for (var i = 0; i < tiles.length; i++) {
      let tile = tiles[i];

      // populate the imageURI and enhancedImageURI if tile is in compact format
      if (tile.hasOwnProperty('imageURI') && assets.hasOwnProperty(tile.imageURI)) {
        tile.imageURI = assets[tile.imageURI];
      }
      if (tile.hasOwnProperty('enhancedImageURI') && assets.hasOwnProperty(tile.enhancedImageURI)) {
        tile.enhancedImageURI = assets[tile.enhancedImageURI];
      }
      if (tile.frecent_sites) {
        output.ui[locale].suggestedTiles.push(tile);
      }
      else {
        output.ui[locale].directoryTiles.push(tile);
      }
    }
  }

  return output;
}
