import fetch from 'isomorphic-fetch';

export const REQUEST_LOCALES = 'REQUEST_LOCALES';
export const RECEIVE_LOCALES = 'RECEIVE_LOCALES';
export const REQUEST_TILES = 'REQUEST_TILES';
export const RECEIVE_TILES = 'RECEIVE_TILES';
export const SELECT_CHANNEL = 'SELECT_CHANNEL';
export const SELECT_LOCALE = 'SELECT_LOCALE';
export const SELECT_TYPE = 'SELECT_TYPE';

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

function requestLocales(channel) {
  return {
    type: REQUEST_LOCALES,
    channel
  };
}

function requestTiles(channel, locale) {
  return {
    type: REQUEST_TILES,
    channel,
    locale
  };
}

function receiveLocales(channel, json) {
  // Massage the json results into what we want.
  var locales = {};
  Object.keys(json).map(function(value, index) {
    locales[value] = {
      tileIndexUrl: json[value].ag,
      isFetching: false
    };
  });
  return {
    type: RECEIVE_LOCALES,
    channel: channel,
    locales: locales,
    receivedAt: Date.now()
  };
}

function receiveTiles(channel, locale, json) {
  return {
    type: RECEIVE_TILES,
    channel: channel,
    locale: locale,
    directoryTiles: json.directory,
    suggestedTiles: json.suggested,
    receivedAt: Date.now()
  };
}

function fetchLocales(state, channel) {
  return dispatch => {
    dispatch(requestLocales(channel));
    return fetch(state.channels[channel].localeIndexUrl)
      .then(response => response.json())
      .then(json => dispatch(receiveLocales(channel, json)));
  };
}

function fetchTiles(state, channel, locale) {
  return dispatch => {
    dispatch(requestTiles(channel, locale));
    return fetch(state.channels[channel].locales[locale].tileIndexUrl)
      .then(response => response.json())
      .then(json => dispatch(receiveTiles(channel, locale, json)));
  };
}

function shouldFetchLocales(state, channel) {
  const channelObj = state.channels[channel];
  if (!channelObj.locales && !channelObj.isFetching) {
    return true;
  }
  return false;
}

function shouldFetchTiles(state, channel, locale) {
  const localeObj = state.channels[channel].locales[locale];
  if (localeObj && !localeObj.directoryTiles && !localeObj.isFetching) {
    return true;
  }
  return false;
}

export function fetchLocalesIfNeeded(channel) {
  return (dispatch, getState) => {
    if (shouldFetchLocales(getState().WebtilesPreviewer, channel)) {
      return dispatch(fetchLocales(getState().WebtilesPreviewer, channel));
    } else {
      return dispatch(selectLocale(Object.keys(getState().WebtilesPreviewer.channels[channel].locales)[0]));
    }
  };
}

export function fetchTilesIfNeeded(channel, locale) {
  return (dispatch, getState) => {
    if (shouldFetchTiles(getState().WebtilesPreviewer, channel, locale)) {
      return dispatch(fetchTiles(getState().WebtilesPreviewer, channel, locale));
    }
  };
}
