import { combineReducers } from 'redux';
import {
  UPCOMING_INIT_DATA_START,
  UPCOMING_INIT_DATA_SUCCESS,
  UPCOMING_INIT_DATA_ERROR,
  UPCOMING_SELECT_CHANNEL,
  UPCOMING_SELECT_LOCALE,
  UPCOMING_SELECT_TYPE,
  UPCOMING_UNSCHEDULE_START,
  UPCOMING_UNSCHEDULE_SUCCESS,
  UPCOMING_UNSCHEDULE_ERROR,
  UPCOMING_LOAD_DISTRIBUTION_START,
  UPCOMING_LOAD_DISTRIBUTION_SUCCESS,
  UPCOMING_LOAD_DISTRIBUTION_ERROR

} from '../actions/Upcoming';

function selectedChannel(state = 'desktop', action) {
  switch (action.type) {
  case UPCOMING_SELECT_CHANNEL:
    return action.channel;
  default:
    return state;
  }
}

function initData(state = {
  url: '/api/upcoming/init_data',
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
  case UPCOMING_INIT_DATA_START:
    return Object.assign({}, state, {
      isFetching: true
    });
  case UPCOMING_INIT_DATA_ERROR:
    return Object.assign({}, state, {
      isFetching: false,
      errorMessage: action.message
    });
  case UPCOMING_INIT_DATA_SUCCESS:
    return Object.assign({}, state, {
      isFetching: false,
      isLoaded: true,
      env: action.env,
      channels: action.channels,
      distributions: action.distributions,
      schema: action.schema,
      lastUpdated: action.receivedAt
    });
  case UPCOMING_UNSCHEDULE_SUCCESS:
    return Object.assign({}, state, {
      distributions: action.distributions,
      lastUpdated: action.receivedAt
    });
  default:
    return state;
  }
}

function distribution(state = {
  unscheduleUrl: '/api/upcoming/unschedule',
  refreshUrl: '/api/upcoming/distributions',
  isLoaded: false,
  isLoading: false,
  errorMessage: null,
  distributionId: null,
  scheduled: null,
  selectedLocale: null,
  selectedType: null,
  tiles: {}
}, action) {
  switch (action.type) {
  case UPCOMING_LOAD_DISTRIBUTION_START:
    return Object.assign({}, state, {
      isLoaded: false,
      isLoading: true,
      errorMessage: null,
      selectedLocale: null,
      selectedType: null,
      tiles: {},
      distributionId: null,
      scheduled: null
    });
  case UPCOMING_LOAD_DISTRIBUTION_ERROR:
    return Object.assign({}, state, {
      isLoaded: false,
      isLoading: false,
      errorMessage: action.message,
      tiles: {}
    });
    case UPCOMING_LOAD_DISTRIBUTION_SUCCESS:
      return Object.assign({}, state, {
        isLoaded: true,
        isLoading: false,
        errorMessage: null,
        selectedLocale: Object.keys(action.tiles.ui)[0],
        selectedType: 'directory',
        tiles: action.tiles,
        distributionId: action.distribution.id,
        scheduled: action.distribution.scheduled_at
      });
    case UPCOMING_SELECT_LOCALE:
      return Object.assign({}, state, {
        selectedLocale: action.locale
      });
    case UPCOMING_SELECT_TYPE:
      return Object.assign({}, state, {
        selectedType: action.tileType
      });
  default:
    return state;
  }
}

export const Upcoming = combineReducers({
  initData,
  selectedChannel,
  distribution
});
