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
export const AUTHORING_SET_PUBLISH_DATE = 'AUTHORING_SET_PUBLISH_DATE';
export const AUTHORING_SET_DEPLOY_NOW = 'AUTHORING_SET_DEPLOY_NOW';
export const AUTHORING_PUBLISH_START = 'AUTHORING_PUBLISH_START';
export const AUTHORING_PUBLISH_SUCCESS = 'AUTHORING_PUBLISH_SUCCESS';
export const AUTHORING_PUBLISH_ERROR = 'AUTHORING_PUBLISH_ERROR';

function requestInitData() {
  return {
    type: INIT_DATA_START
  };
}

function checkStatus(response){
  if (response.status >= 200 && response.status < 300) {
    return response.json();
  } else {
    throw new Error('HTTP ' + response.status + ' - ' + response.statusText);
  }
}

function fetchInitData(state) {
  return dispatch => {
    dispatch(requestInitData());
    return fetch(state.initData.url)
      .then(checkStatus)
      .then(json => {
        dispatch((() => ({
          type: INIT_DATA_SUCCESS,
          env: json.d.env,
          channels: json.d.chans,
          distributions: json.d.dists,
          schema: json.d.schema,
          receivedAt: Date.now()
        }))());
      })
      .catch(error => {
        dispatch((() => ({
          type: INIT_DATA_ERROR,
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

    reader.onerror = (e) => {
      dispatch((() => ({
        type: LOAD_DISTRIBUTION_FILE_ERROR,
        message: 'Error loading file.'
      }))());
    };

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

// Helper for processing distribution files
function separateTilesTypes(data, assets) {
  // Separate Tiles types from a list of tiles in 2 groups: suggested, directory
  var output = {raw: data, ui: {}};

  for (var locale in output.raw) {
    var tiles = data[locale];

    output.ui[locale] = {
      suggestedTiles: [],
      directoryTiles: []
    };

    for (var i = 0; i < tiles.length; i++) {
      var tile = tiles[i];

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

export function setPublishDate(momentObj) {
  return (dispatch, getState) => {
    // If the moment isn't an empty string, we set deployNow to 0.
    if (momentObj !== '') {
      dispatch(setDeployNow(0));
    }

    dispatch((() => ({
      type: AUTHORING_SET_PUBLISH_DATE,
      moment: momentObj
    }))());
  };
}

export function setDeployNow(deployNow) {
  return {
    type: AUTHORING_SET_DEPLOY_NOW,
    deployNow
  };
}

export function publishDistribution() {
  return (dispatch, getState) => {
  /**
   * Send tiles to backend for publication.
   * Assumes data is correct.
   */
   dispatch((() => ({type: AUTHORING_PUBLISH_START}))());

   var state = getState().Authoring;
   var compressedTiles = compressPayload(state.distribution.tiles.raw);
   var scheduled = state.distribution.scheduled;
   var params = {
     deploy: state.distribution.deployNow,
     channelId: state.initData.channels.find((element, index, array) => {return element.name === state.selectedChannel;}).id
   };
   if (scheduled) {
      // timestamp in seconds
      params['scheduledTS'] = scheduled.toDate().getTime() / 1000 | 0;
   }

   var url = state.distribution.publishUrl;
   url = url + '?' + encodeQueryParams(params);

   fetch(url, {
     method: 'POST',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json'
       //,'X-CSRFToken': document.querySelector('meta[name=csrf-token]').attributes['content'].value
     },
     body: JSON.stringify(compressedTiles)
   })
     .then(response => {
       response.json()
         .then(json => {
           if ('err' in json) { // error!
             dispatch((() => ({
               type: AUTHORING_PUBLISH_ERROR,
               message: 'Publishing Failed. Error: ' + json.err[0].msg +
                        ' (HTTP ' + response.status + ' - ' +
                        response.statusText + ')',
             }))());
           } else { // success!
             dispatch((() => ({
               type: AUTHORING_PUBLISH_SUCCESS,
               results: json
             }))());
           }
         })
         .catch(error => {
           throw new Error('HTTP ' + response.status + ' - ' + response.statusText);
         });
     })
     .catch(error => {
       dispatch((() => ({
         type: AUTHORING_PUBLISH_ERROR,
         message: 'Publishing Failed. ' + error
       }))());
      });
  };
};

// Helper for publishing tiles
function cloneTile(tile) {
  var copy = JSON.parse(JSON.stringify(tile));
  return copy;
};

// Helper for publishing tiles
function compressPayload(tiles) {
  /* *
   * compress the payload for publishing. Note that the tiles might be cached,
   * therefore we create a copy here
   */
  var copies = {};
  var uri2id = {};
  var assets = {};
  var id = 0;

  for (var locale in tiles) {
    copies[locale] = [];
    var locale_tiles = tiles[locale];
    for (var i = 0, len = locale_tiles.length; i < len; i++) {
      var tile = locale_tiles[i];
      var imageURI = tile.imageURI;
      var copy = cloneTile(tile);

      copies[locale].push(copy);
      if (imageURI in uri2id) {
        copy.imageURI = uri2id[imageURI];
      } else {
        uri2id[imageURI] = copy.imageURI = id.toString();
        id++;
      }
      if (tile.hasOwnProperty('enhancedImageURI')) {
        imageURI = tile.enhancedImageURI;
        if (imageURI in uri2id) {
          copy.enhancedImageURI = uri2id[imageURI];
        } else {
          uri2id[imageURI] = copy.enhancedImageURI = id.toString();
          id++;
        }
      }
    }
  }

  for (var uri in uri2id) {
    if (uri2id.hasOwnProperty(uri)) {
      assets[uri2id[uri]] = uri;
    }
  }

  return {
    assets,
    distributions: copies
  };
};

function encodeQueryParams(params)
{
  var ret = [];
  for (var d in params) {
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(params[d]));
  }
  return ret.join('&');
}
