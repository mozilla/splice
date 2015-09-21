import {
	REQUEST_ADD_CAMPAIGN,
	RECEIVE_ADD_CAMPAIGN,
	REQUEST_CAMPAIGNS,
	RECEIVE_CAMPAIGNS,
	REQUEST_CAMPAIGN_VIEW,
	RECEIVE_CAMPAIGN_VIEW
} from 'actions/Campaigns/CampaignActions';

const initialState = {
	campaignRows: [],
	campaignDetails: [],
	isSavingCampaign: false,
	isFetchingCampaigns: false,
	isFetchingCampaignView: false
};

export function Campaign(state = initialState, action = null) {
	switch (action.type) {
		case REQUEST_ADD_CAMPAIGN:
			return _.assign({}, state, {
				isSavingCampaign: true
			});
		case RECEIVE_ADD_CAMPAIGN:
			return _.assign({}, state, {
				campaignRows: [...state.campaignRows, action.json],
				isSavingCampaign: false
			});
		case REQUEST_CAMPAIGNS:
			return _.assign({}, state, {
				isFetchingCampaigns: true
			});
		case RECEIVE_CAMPAIGNS:
			return _.assign({}, state, {
				campaignRows: action.campaignRows,
				isFetchingCampaigns: false
			});
		case REQUEST_CAMPAIGN_VIEW:
			return _.assign({}, state, {
				isFetchingCampaignView: true
			});
		case RECEIVE_CAMPAIGN_VIEW:
			return _.assign({}, state, {
				campaignDetails: action.campaignDetails,
				isFetchingCampaignView: false
			});
		default:
			return state;
	}
}
