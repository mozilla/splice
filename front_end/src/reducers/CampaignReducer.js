import {
  REQUEST_CREATE_CAMPAIGN,
  RECEIVE_CREATE_CAMPAIGN,
  REQUEST_UPDATE_CAMPAIGN,
  RECEIVE_UPDATE_CAMPAIGN,
  REQUEST_BULK_UPLOAD,
  RECEIVE_BULK_UPLOAD,
  REQUEST_CAMPAIGNS,
  RECEIVE_CAMPAIGNS,
  REQUEST_CAMPAIGN,
  RECEIVE_CAMPAIGN,
  CAMPAIGN_SET_FILTER,
  CAMPAIGN_SET_DETAILS_VAR
} from 'actions/Campaigns/CampaignActions';

const initialState = {
  rows: [],
  details: {},
  isSaving: false,
  isFetching: false,
  filters: {
    past: false,
    scheduled: false,
    inFlight: true
  }
};

export function Campaign(state = initialState, action = null) {
  let data;
  switch (action.type) {
    case CAMPAIGN_SET_DETAILS_VAR:
      return _.assign({}, state, {
        details: _.assign({}, state.details, {
          [action.variable]: action.value
        })
      });
    case REQUEST_CREATE_CAMPAIGN:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_CREATE_CAMPAIGN:
      data = state.rows;
      if(action.json.result !== undefined){
        data = [action.json.result, ...state.rows];
      }
      return _.assign({}, state, {
        rows: data,
        isSaving: false
      });
    case REQUEST_UPDATE_CAMPAIGN:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_UPDATE_CAMPAIGN:
      data = state.details;
      if(action.json.result !== undefined){
        data = action.json.result;
      }
      return _.assign({}, state, {
        details: data,
        isSaving: false
      });
    case REQUEST_BULK_UPLOAD:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_BULK_UPLOAD:
      return _.assign({}, state, {
        isSaving: false
      });
    case REQUEST_CAMPAIGNS:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_CAMPAIGNS:
      data = [];
      if(action.json.results !== undefined){
        data = action.json.results;
      }
      return _.assign({}, state, {
        rows: data,
        isFetching: false
      });
    case REQUEST_CAMPAIGN:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_CAMPAIGN:
      data = {};
      if(action.json.result !== undefined){
        data = action.json.result;
      }
      return _.assign({}, state, {
        details: data,
        isFetching: false
      });
    case CAMPAIGN_SET_FILTER:
      return _.assign({}, state, {
        filters: _.assign({}, state.filters, {
          [action.variable]: action.value
        })
      });
    default:
      return state;
  }
}