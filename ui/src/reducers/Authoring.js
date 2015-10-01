import { combineReducers } from 'redux';
import {
  REQUEST_INIT_DATA,
  RECEIVE_INIT_DATA,
  AUTHORING_SELECT_CHANNEL,
  LOAD_DISTRIBUTION_FILE
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

export const Authoring = combineReducers({
  initData,
  selectedChannel
});
