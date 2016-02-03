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
  let data;
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
      data = state.rows;
      if(action.json.result !== undefined){
        data = [action.json.result, ...state.rows];
      }
      return _.assign({}, state, {
        rows: data,
        isSaving: false
      });
    case REQUEST_UPDATE_ADGROUP:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_UPDATE_ADGROUP:
      data = state.details;
      if(action.json.result !== undefined){
        data = action.json.result;
      }
      return _.assign({}, state, {
        details: data,
        isSaving: false
      });
    case REQUEST_ADGROUPS:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_ADGROUPS:
      data = [];
      if(action.json.results !== undefined){
        data = action.json.results;
      }
      return _.assign({}, state, {
        rows: data,
        isFetching: false
      });
    case REQUEST_ADGROUP:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_ADGROUP:
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
