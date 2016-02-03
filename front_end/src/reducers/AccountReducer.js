import {
  REQUEST_CREATE_ACCOUNT,
  RECEIVE_CREATE_ACCOUNT,
  REQUEST_UPDATE_ACCOUNT,
  RECEIVE_UPDATE_ACCOUNT,
  REQUEST_ACCOUNTS,
  RECEIVE_ACCOUNTS,
  REQUEST_ACCOUNT,
  RECEIVE_ACCOUNT
} from 'actions/Accounts/AccountActions';

const initialState = {
  rows: [],
  details: {},
  isSaving: false,
  isFetching: false
};

export function Account(state = initialState, action = null) {
  let data;
  switch (action.type) {
    case REQUEST_CREATE_ACCOUNT:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_CREATE_ACCOUNT:
      data = state.rows;
      if(action.json.result !== undefined){
        data = [action.json.result, ...state.rows];
      }
      return _.assign({}, state, {
        rows: data,
        isSaving: false
      });
    case REQUEST_UPDATE_ACCOUNT:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_UPDATE_ACCOUNT:
      data = state.details;
      if(action.json.result !== undefined){
        data = action.json.result;
      }
      return _.assign({}, state, {
        details: data,
        isSaving: false
      });
    case REQUEST_ACCOUNTS:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_ACCOUNTS:
      data = [];
      if(action.json.results !== undefined){
        data = action.json.results;
      }
      return _.assign({}, state, {
        rows: data,
        isFetching: false
      });
    case REQUEST_ACCOUNT:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_ACCOUNT:
      data = {};
      if(action.json.result !== undefined){
        data = action.json.result;
      }
      return _.assign({}, state, {
        details: data,
        isFetching: false
      });
    default:
      return state;
  }
}
