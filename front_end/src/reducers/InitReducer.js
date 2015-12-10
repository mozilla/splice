import {
  REQUEST_INIT,
  RECEIVE_INIT
} from 'actions/Init/InitActions';

const initialState = {
  categories: [],
  channels: [],
  countries: [],
  locales: [],
  isFetching: false
};

export function Init(state = initialState, action = null) {
  let data;
  switch (action.type) {
    case REQUEST_INIT:{
      return _.assign({}, state, {
        isFetching: true
      });
    }
    case RECEIVE_INIT:
      data = state;
      if(action.json.result !== undefined){
        data = action.json.result;
      }

      return _.assign({}, state, {
        categories: data.categories,
        channels: data.channels,
        countries: data.countries,
        locales: data.locales,
        isFetching: false
      });
    default:
      return state;
  }
}