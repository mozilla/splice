import {
  REQUEST_CREATE_CAMPAIGN,
  RECEIVE_CREATE_CAMPAIGN,
  REQUEST_UPDATE_CAMPAIGN,
  RECEIVE_UPDATE_CAMPAIGN,
  REQUEST_CAMPAIGNS,
  RECEIVE_CAMPAIGNS,
  REQUEST_CAMPAIGN,
  RECEIVE_CAMPAIGN,
  CAMPAIGN_SET_PAST,
  CAMPAIGN_SET_SCHEDULED,
  CAMPAIGN_SET_IN_FLIGHT
} from 'actions/Campaigns/CampaignActions';

const initialState = {
  rows: [],
  details: {},
  isSaving: false,
  isFetching: false,
  past: false,
  scheduled: false,
  inFlight: true
};

export function Campaign(state = initialState, action = null) {
  switch (action.type) {
    case REQUEST_CREATE_CAMPAIGN:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_CREATE_CAMPAIGN:
      let rows = state.rows;
      if(action.json.result !== null){
        rows = [action.json.result, ...state.rows];
      }
      return _.assign({}, state, {
        rows: rows,
        isSaving: false
      });
    case REQUEST_UPDATE_CAMPAIGN:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_UPDATE_CAMPAIGN:
      let details = state.details;
      if(action.json.result !== null){
        details = action.json.result;
      }
      return _.assign({}, state, {
        details: details,
        isSaving: false
      });
    case REQUEST_CAMPAIGNS:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_CAMPAIGNS:
      return _.assign({}, state, {
        rows: action.json.results,
        isFetching: false
      });
    case REQUEST_CAMPAIGN:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_CAMPAIGN:
      return _.assign({}, state, {
        details: action.json.result,
        isFetching: false
      });
    case CAMPAIGN_SET_PAST:
      return _.assign({}, state, {
        past: action.value
      });
    case CAMPAIGN_SET_SCHEDULED:
      return _.assign({}, state, {
        scheduled: action.value
      });
    case CAMPAIGN_SET_IN_FLIGHT:
      return _.assign({}, state, {
        inFlight: action.value
      });
    default:
      return state;
  }
}
