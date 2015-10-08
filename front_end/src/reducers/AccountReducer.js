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
      if(action.json.result !== null){
        rows = [action.json.result, ...state.rows];
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
      if(action.json.result !== null){
        details = action.json.result;
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
        rows: action.json.results,
        isFetching: false
      });
    case REQUEST_ACCOUNT:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_ACCOUNT:
      return _.assign({}, state, {
        details: action.json.result,
        isFetching: false
      });
    default:
      return state;
  }
}
