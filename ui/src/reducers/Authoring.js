import { combineReducers } from 'redux';
import {
  REQUEST_INIT_DATA,
  RECEIVE_INIT_DATA,
  AUTHORING_SELECT_CHANNEL,
  LOAD_DISTRIBUTION_FILE_START,
  LOAD_DISTRIBUTION_FILE_ERROR,
  LOAD_DISTRIBUTION_FILE_SUCCESS
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
  env: null,
  channels: [],
  distributions: {},
  schema: {},
  lastUpdated: null
}, action) {
  switch (action.type) {
  case REQUEST_INIT_DATA:
    return Object.assign({}, state, {
      isFetching: true
    });
  case RECEIVE_INIT_DATA:
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
  isLoaded: false,
  isLoading: false,
  errorMessage: null
}, action) {
  switch (action.type) {
  case LOAD_DISTRIBUTION_FILE_START:
    return Object.assign({}, state, {
      isLoaded: false,
      isLoading: true,
      errorMessage: null
    });
  case LOAD_DISTRIBUTION_FILE_ERROR:
    return Object.assign({}, state, {
      isLoaded: false,
      isLoading: false,
      errorMessage: 'Error loading distribution file'
    });
    case LOAD_DISTRIBUTION_FILE_SUCCESS:
      return Object.assign({}, state, {
        isLoaded: true,
        isLoading: false,
        errorMessage: null
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
