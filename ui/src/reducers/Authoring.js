import { combineReducers } from 'redux';
import {
  INIT_DATA_START,
  INIT_DATA_SUCCESS,
  INIT_DATA_ERROR,
  AUTHORING_SELECT_CHANNEL,
  AUTHORING_SELECT_LOCALE,
  AUTHORING_SELECT_TYPE,
  LOAD_DISTRIBUTION_FILE_START,
  LOAD_DISTRIBUTION_FILE_ERROR,
  LOAD_DISTRIBUTION_FILE_SUCCESS,
  AUTHORING_PUBLISH_START,
  AUTHORING_PUBLISH_SUCCESS,
  AUTHORING_PUBLISH_ERROR
} from '../actions/Authoring';

function selectedChannel(state = 'desktop', action) {
  switch (action.type) {
  case AUTHORING_SELECT_CHANNEL:
    return action.channel;
  default:
    return state;
  }
}

function initData(state = {
  url: '/api/authoring/init_data',
  isLoaded: false,
  isFetching: false,
  errorMessage: null,
  env: null,
  channels: [],
  distributions: {},
  schema: {},
  lastUpdated: null
}, action) {
  switch (action.type) {
  case INIT_DATA_START:
    return Object.assign({}, state, {
      isFetching: true
    });
  case INIT_DATA_ERROR:
    return Object.assign({}, state, {
      isFetching: false,
      errorMessage: action.message
    });
  case INIT_DATA_SUCCESS:
    return Object.assign({}, state, {
      isFetching: false,
      isLoaded: true,
      env: action.env,
      channels: action.channels,
      distributions: action.distributions,
      schema: action.schema,
      lastUpdated: action.receivedAt
    });
  default:
    return state;
  }
}

function distribution(state = {
  publishUrl: '/api/authoring/all_tiles',
  isLoaded: false,
  isLoading: false,
  isPublishing: false,
  errorMessage: null,
  scheduled: '',
  selectedLocale: null,
  selectedType: null,
  tiles: {}
}, action) {
  switch (action.type) {
  case LOAD_DISTRIBUTION_FILE_START:
    return Object.assign({}, state, {
      isLoaded: false,
      isLoading: true,
      errorMessage: null,
      selectedLocale: null,
      selectedType: null,
      tiles: {}
    });
  case LOAD_DISTRIBUTION_FILE_ERROR:
    return Object.assign({}, state, {
      isLoaded: false,
      isLoading: false,
      errorMessage: action.message,
      tiles: {}
    });
    case LOAD_DISTRIBUTION_FILE_SUCCESS:
      return Object.assign({}, state, {
        isLoaded: true,
        isLoading: false,
        errorMessage: null,
        selectedLocale: Object.keys(action.tiles)[0],
        selectedType: 'directory',
        tiles: action.tiles
      });
    case AUTHORING_SELECT_LOCALE:
      return Object.assign({}, state, {
        selectedLocale: action.locale
      });
    case AUTHORING_SELECT_TYPE:
      return Object.assign({}, state, {
        selectedType: action.tileType
      });
    case AUTHORING_PUBLISH_START:
      return Object.assign({}, state, {
        isPublishing: true
      });
    case AUTHORING_PUBLISH_ERROR:
      return Object.assign({}, state, {
        isPublishing: false,
        errorMessage: action.message
      });
    case AUTHORING_PUBLISH_SUCCESS:
      return Object.assign({}, state, {
        isPublishing: false
      });
  default:
    return state;
  }
}

export const Authoring = combineReducers({
  initData,
  selectedChannel,
  distribution
});
