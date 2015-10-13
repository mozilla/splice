import {
  REQUEST_INIT,
  RECEIVE_INIT
} from 'actions/Init/InitActions';

const initialState = {
  channels: [],
  countries: [],
  locales: [],
  isFetching: false
};

export function Init(state = initialState, action = null) {
  switch (action.type) {
    case REQUEST_INIT:{
      return _.assign({}, state, {
        isFetching: true
      });
    }
    case RECEIVE_INIT:
      return _.assign({}, state, {
        channels: action.json.result.channels,
        countries: action.json.result.countries,
        locales: action.json.result.locales,
        isFetching: false
      });
    default:
      return state;
  }
}