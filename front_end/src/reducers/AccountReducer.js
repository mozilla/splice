import {
  REQUEST_ADD_ACCOUNT,
  RECEIVE_ADD_ACCOUNT,
  REQUEST_ACCOUNTS,
  RECEIVE_ACCOUNTS,
  REQUEST_ACCOUNT,
  RECEIVE_ACCOUNT
} from 'actions/Accounts/AccountActions';

const initialState = {
  rows: [],
  details: [],
  isSaving: false,
  isFetching: false
};

export function Account(state = initialState, action = null) {
  switch (action.type) {
    case REQUEST_ADD_ACCOUNT:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_ADD_ACCOUNT:
      return _.assign({}, state, {
        rows: [...state.rows, action.json],
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
