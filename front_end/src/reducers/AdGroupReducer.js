import {
  REQUEST_CREATE_ADGROUP,
  RECEIVE_CREATE_ADGROUP,
  REQUEST_UPDATE_ADGROUP,
  RECEIVE_UPDATE_ADGROUP,
  REQUEST_ADGROUPS,
  RECEIVE_ADGROUPS,
  REQUEST_ADGROUP,
  RECEIVE_ADGROUP,
  ADGROUP_SET_DETAILS_VAR
} from 'actions/AdGroups/AdGroupActions';

const initialState = {
  rows: [],
  details: {},
  isSaving: false,
  isFetching: false
};

export function AdGroup(state = initialState, action = null) {
  switch (action.type) {
    case ADGROUP_SET_DETAILS_VAR:
      return _.assign({}, state, {
        details: _.assign({}, state.details, {
          [action.variable]: action.value
        })
      });
    case REQUEST_CREATE_ADGROUP:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_CREATE_ADGROUP:
      let rows = state.rows;
      if(action.json.result !== undefined){
        rows = [action.json.result, ...state.rows];
      }
      return _.assign({}, state, {
        rows: rows,
        isSaving: false
      });
    case REQUEST_UPDATE_ADGROUP:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_UPDATE_ADGROUP:
      let details = state.details;
      if(action.json.result !== undefined){
        details = action.json.result;
      }
      return _.assign({}, state, {
        details: details,
        isSaving: false
      });
    case REQUEST_ADGROUPS:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_ADGROUPS:
      return _.assign({}, state, {
        rows: action.json.results,
        isFetching: false
      });
    case REQUEST_ADGROUP:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_ADGROUP:
      return _.assign({}, state, {
        details: action.json.result,
        isFetching: false
      });
    default:
      return state;
  }
}
