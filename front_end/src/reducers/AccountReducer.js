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
  switch (action.type) {
    case REQUEST_CREATE_ACCOUNT:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_CREATE_ACCOUNT:
      let rows = state.rows;
      if(action.json !== null){
        rows = [action.json, ...state.rows];
      }
      return _.assign({}, state, {
        rows: rows,
        isSaving: false
      });
    case REQUEST_UPDATE_ACCOUNT:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_UPDATE_ACCOUNT:
      let details = state.details;
      if(action.json !== null){
        details = action.json;
      }
      return _.assign({}, state, {
        details: details,
        isSaving: false
      });
    case REQUEST_ACCOUNTS:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_ACCOUNTS:
      return _.assign({}, state, {
        rows: action.rows,
        isFetching: false
      });
    case REQUEST_ACCOUNT:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_ACCOUNT:
      return _.assign({}, state, {
        details: action.details,
        isFetching: false
      });
    default:
      return state;
  }
}
