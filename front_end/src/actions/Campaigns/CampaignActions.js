import fetch from 'isomorphic-fetch';

let apiUrl;
if (typeof __DEVELOPMENT__ !== 'undefined' && __DEVELOPMENT__ === true) {
	apiUrl = __DEVAPI__;
} else {
	apiUrl = __LIVEAPI__;
}

export const REQUEST_ADD_CAMPAIGN = 'REQUEST_ADD_CAMPAIGN';
export const RECEIVE_ADD_CAMPAIGN = 'RECEIVE_ADD_CAMPAIGN';

export const REQUEST_CAMPAIGNS = 'REQUEST_CAMPAIGNS';
export const RECEIVE_CAMPAIGNS = 'RECEIVE_CAMPAIGNS';

export const REQUEST_CAMPAIGN_VIEW = 'REQUEST_CAMPAIGN_VIEW';
export const RECEIVE_CAMPAIGN_VIEW = 'RECEIVE_CAMPAIGN_VIEW';

function requestAddCampaign() {
	return {type: REQUEST_ADD_CAMPAIGN};
}

function receiveAddCampaign(json) {
	return {type: RECEIVE_ADD_CAMPAIGN, json};
}

function requestCampaigns() {
	return {type: REQUEST_CAMPAIGNS};
}
function receiveCampaigns(json) {
	return {
		type: RECEIVE_CAMPAIGNS,
		campaignRows: json.results
	};
}

function requestCampaignView() {
	return {type: REQUEST_CAMPAIGN_VIEW};
}
function receiveCampaignView(json) {
	return {
		type: RECEIVE_CAMPAIGN_VIEW,
		campaignDetails: json.result
	};
}

export function fetchCampaignView(campaignId) {
	// thunk middleware knows how to handle functions
	return function next(dispatch) {
		dispatch(requestCampaignView());
		// Return a promise to wait for
		return fetch(apiUrl + '/api/campaign/' + campaignId)
			.then(response => response.json())
			.then(json => new Promise(resolve => {
				dispatch(receiveCampaignView(json));
				resolve();
			}));
	};
}

export function fetchCampaigns(accountId = null) {
	// thunk middleware knows how to handle functions
	return function next(dispatch) {
		dispatch(requestCampaigns());
		// Return a promise to wait for
		let params = '';
		if(accountId !== null){
			params = '?account_id=' + accountId;
		}

		return fetch(apiUrl + '/api/campaigns' + params)
			.then(response => response.json())
			.then(json => {
				dispatch(receiveCampaigns(json));
			}
		);
	};
}

export function saveCampaign(data) {
	// thunk middleware knows how to handle functions
	return function next(dispatch) {
		dispatch(requestAddCampaign());
		// Return a promise to wait for
		/*return fetch(apiUrl + '/api/campaigns', {
		 method: 'post',
		 headers: {
		 'Accept': 'application/json',
		 'Content-Type': 'application/json'
		 },
		 body: JSON.stringify({
		 name: data.text
		 })
		 }).then(response => response.json())
		 .then((json) => {
		 dispatch(receiveAddAccount({
		 'created_at': '',
		 'email': 'test@gmail.com',
		 'id': 99,
		 'name': data.text,
		 'phone': '+1(888)0000000'
		 }));
		 });*/
		return fetch('http://localhost:9999/public/mock/campaigns.json')
			.then(response => response.json())
			.then(() =>
				setTimeout(() => {
					dispatch(receiveAddCampaign({
						'created_at': '',
						'email': 'test@gmail.com',
						'id': 99,
						'name': data.text,
						'phone': '+1(888)0000000'
					}));
				}, 1000)
		);
	};
}
