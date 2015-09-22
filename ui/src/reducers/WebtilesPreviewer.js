import { combineReducers } from 'redux';
import {
  SELECT_CHANNEL, SELECT_LOCALE, SELECT_TYPE,
  REQUEST_LOCALES, REQUEST_TILES,
  RECEIVE_LOCALES, RECEIVE_TILES
} from '../actions';

function selectedChannel(state = 'desktop', action) {
  switch (action.type) {
  case SELECT_CHANNEL:
    return action.channel;
  default:
    return state;
  }
}

function selectedLocale(state = null, action) {
  switch (action.type) {
  case SELECT_LOCALE:
    return action.locale;
  case RECEIVE_LOCALES:
    return Object.keys(action.locales)[0];
  default:
    return state;
  }
}

function selectedType(state = null, action) {
  switch (action.type) {
  case SELECT_TYPE:
    return action.tileType;
  case RECEIVE_TILES:
    return 'directory';
  default:
    return state;
  }
}

function locale(state = {
  tileIndexUrl: null,
  isFetching: false,
  directoryTiles: null,
  suggestedTiles: null
}, action) {
  switch (action.type) {
  case REQUEST_TILES:
    return Object.assign({}, state, {
      isFetching: true
    });
  case RECEIVE_TILES:
    return Object.assign({}, state, {
      isFetching: false,
      directoryTiles: action.directoryTiles,
      suggestedTiles: action.suggestedTiles,
      lastUpdated: action.receivedAt
    });
  default:
    return state;
  }
}

function locales(state = [], action) {
  switch (action.type) {
  case RECEIVE_LOCALES:
    return action.locales;
  case REQUEST_TILES:
  case RECEIVE_TILES:
    return Object.assign({}, state, {
      [action.locale]: locale(state[action.locale], action)
    });
  default:
    return state;
  }
}

function channel(state = {
  localeIndexUrl: null,
  isFetching: false,
  locales: null,
}, action) {
  switch (action.type) {
  case REQUEST_LOCALES:
    return Object.assign({}, state, {
      isFetching: true
    });
  case RECEIVE_LOCALES:
  case RECEIVE_TILES:
  case REQUEST_TILES:
    return Object.assign({}, state, {
      isFetching: false,
      locales: locales(state.locales, action),
      lastUpdated: action.receivedAt
    });
  default:
    return state;
  }
}

function channels(state = {
    desktop: {
        name: 'Desktop',
        localeIndexUrl: 'https://tiles.cdn.mozilla.net/desktop_tile_index_v3.json',
        isFetching: false
    },
    prerelease: {
        name: 'Prerelease',
        localeIndexUrl: 'https://tiles.cdn.mozilla.net/desktop-prerelease_tile_index_v3.json',
        isFetching: false
    },
    android: {
        name: 'Android',
        localeIndexUrl: 'https://tiles.cdn.mozilla.net/android_tile_index_v3.json',
        isFetching: false
    }
}, action) {
  switch (action.type) {
  case RECEIVE_LOCALES:
  case REQUEST_LOCALES:
  case RECEIVE_TILES:
  case REQUEST_TILES:
    return Object.assign({}, state, {
      [action.channel]: channel(state[action.channel], action)
    });
  default:
    return state;
  }
}

export const WebtilesPreviewer = combineReducers({
  channels,
  selectedChannel,
  selectedLocale,
  selectedType
});
