import fetch from 'isomorphic-fetch';

export const LOAD_DISTRIBUTION_START = 'LOAD_DISTRIBUTION_START';
export const LOAD_DISTRIBUTION_SUCCESS = 'LOAD_DISTRIBUTION_SUCCESS';
export const LOAD_DISTRIBUTION_ERROR = 'LOAD_DISTRIBUTION_ERROR';
export const SELECT_DATE = 'SELECT_DATE';
export const SELECT_CHANNEL = 'SELECT_CHANNEL';
export const SELECT_LOCALE = 'SELECT_LOCALE';
export const SELECT_TYPE = 'SELECT_TYPE';

export function selectDate(moment) {
  return {
    type: SELECT_DATE,
    moment
  };
}

export function selectChannel(channel) {
  return {
    type: SELECT_CHANNEL,
    channel
  };
}

export function selectLocale(locale) {
  return {
    type: SELECT_LOCALE,
    locale
  };
}

export function selectType(tileType) {
  return {
    type: SELECT_TYPE,
    tileType
  };
}

function checkStatus(response){
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    if (response.status === 404) {
      throw new Error('No distribution found for this date.');
    }
    throw new Error('HTTP ' + response.status + ' - ' + response.statusText);
  }
}

export function fetchDistribution(moment) {
  return (dispatch, getState) => {
    dispatch((() => ({type: LOAD_DISTRIBUTION_START}))());

    let url = getState().WebtilesPreviewer.distribution.fetchUrl;
    url += '?date=' + moment.format('YYYY-MM-D')
    return fetch(url)
      .then(checkStatus)
      .then(response => response.json())
      .then(json => {
        // Process the results
        let channels = {};
        Object.keys(json.results).forEach(function(channel) {
          channels[channel] = {};

          // Process the S3 artifacts into something more usable
          let index;
          let otherArtifacts = {};
          json.results[channel].forEach(function(artifact) {
            if (artifact.key.includes('index')) {
              // The index file key will be something like: desktop_tile_index.v3.json
              index = JSON.parse(artifact.data);
            } else {
              otherArtifacts[artifact.key] = JSON.parse(artifact.data);
            }
          });

          // Process all the locales in the index
          Object.keys(index).forEach(function(locale) {
            if (locale === '__ver__') return;  // skip that garbage

            // Get the artifact key
            // TODO: Handle multiple distributions if passed
            let agUrl = Array.isArray(index[locale].ag) ? index[locale].ag[0] : index[locale].ag;
            let key = agUrl.split('/').slice(3).join('/');

            // Get and set the tiles
            channels[channel][locale] = otherArtifacts[key];
          });
        });

        // And that's all folks. Let the World know.
        dispatch((() => ({
          type: LOAD_DISTRIBUTION_SUCCESS,
          results: channels
        }))());
      })
      .catch(error => {
        dispatch((() => ({
          type: LOAD_DISTRIBUTION_ERROR,
          message: error.toString()
        }))());
      });
  };
}
