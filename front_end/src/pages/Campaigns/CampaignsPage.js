import React, { Component } from '../../../node_modules/react/addons';
import { connect } from 'react-redux';
import { pageVisit } from 'actions/App/AppActions';
import { fetchCampaigns } from 'actions/Campaigns/CampaignActions';
import { getAccountId } from 'helpers/AppHelpers';

import CampaignList from 'components/Campaigns/CampaignList/CampaignList';

export default class CampaignsPage extends Component {
	componentDidMount() {
		const { dispatch } = this.props;

		pageVisit('Campaigns', this);

		const accountId = getAccountId(this.props);
		dispatch(fetchCampaigns(accountId));
	}

	render() {
		return (
			<div>
				<h1>Campaigns</h1>
				<CampaignList campaignRows={this.props.Campaign.campaignRows}
							  isFetchingCampaigns={this.props.Campaign.isFetchingCampaigns}/>
			</div>
		);
	}
}

CampaignsPage.propTypes = {};

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
	return {
		Account: state.Account,
		Campaign: state.Campaign
	};
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(CampaignsPage);


