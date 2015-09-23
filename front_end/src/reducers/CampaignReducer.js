import {
  REQUEST_ADD_CAMPAIGN,
  RECEIVE_ADD_CAMPAIGN,
  REQUEST_CAMPAIGNS,
  RECEIVE_CAMPAIGNS,
  REQUEST_CAMPAIGN,
  RECEIVE_CAMPAIGN
} from 'actions/Campaigns/CampaignActions';

const initialState = {
  rows: [],
  details: [],
  isSaving: false,
  isFetching: false
};

export function Campaign(state = initialState, action = null) {
  switch (action.type) {
    case REQUEST_ADD_CAMPAIGN:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_ADD_CAMPAIGN:
      return _.assign({}, state, {
        rows: [...state.rows, action.json],
        isSaving: false
      });
    case REQUEST_CAMPAIGNS:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_CAMPAIGNS:
      return _.assign({}, state, {
        rows: action.rows,
        isFetching: false
      });
    case REQUEST_CAMPAIGN:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_CAMPAIGN:
      return _.assign({}, state, {
        details: action.details,
        isFetching: false
      });
    default:
      return state;
  }
}
