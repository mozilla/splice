import moment from 'moment';

import { combineReducers } from 'redux';
import {
  LOAD_DISTRIBUTION_START,
  LOAD_DISTRIBUTION_SUCCESS,
  LOAD_DISTRIBUTION_ERROR,
  SELECT_DATE,
  SELECT_CHANNEL,
  SELECT_LOCALE,
  SELECT_TYPE
} from '../actions/WebtilesPreviewer';

function selectedDate(state = moment(), action) {
  switch (action.type) {
  case SELECT_DATE:
    return action.moment;
  default:
    return state;
  }
}

function distribution(state = {
  fetchUrl: '/api/distributions',
  isLoaded: false,
  isLoading: false,
  errorMessage: null,
  selectedChannel: null,
  selectedLocale: null,
  selectedType: null,
  channels: {}
}, action) {
  switch (action.type) {
  case LOAD_DISTRIBUTION_START:
    return Object.assign({}, state, {
      isLoaded: false,
      isLoading: true,
      errorMessage: null,
      selectedChannel: null,
      selectedLocale: null,
      selectedType: null,
      channels: {}
    });
  case LOAD_DISTRIBUTION_SUCCESS:
    let channels = action.results;
    let selectedChannel = channels.desktop ? 'desktop' : Object.keys(channels)[0];
    let selectedLocale = Object.keys(channels[selectedChannel])[0];
    return Object.assign({}, state, {
      isLoaded: true,
      isLoading: false,
      selectedChannel,
      selectedLocale,
      selectedType: 'directory',
      channels
    });
  case LOAD_DISTRIBUTION_ERROR:
    return Object.assign({}, state, {
      isLoading: false,
      errorMessage: action.message
    });
  case SELECT_CHANNEL:
    return Object.assign({}, state, {
      selectedChannel: action.channel,
      selectedLocale: Object.keys(state.channels[action.channel])[0],
      selectedType: 'directory'
    });
  case SELECT_LOCALE:
    return Object.assign({}, state, {
      selectedLocale: action.locale,
      selectedType: 'directory'
    });
  case SELECT_TYPE:
    return Object.assign({}, state, {
      selectedType: action.tileType
    });
  default:
    return state;
  }
}

export const WebtilesPreviewer = combineReducers({
  selectedDate,
  distribution
});
