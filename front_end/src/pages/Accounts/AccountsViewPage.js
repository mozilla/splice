import React, { Component } from 'react/addons';

import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle, pageVisit } from 'actions/App/AppActions';
import { fetchAccountView } from 'actions/Accounts/AccountActions';
import { fetchCampaigns } from 'actions/Campaigns/CampaignActions';

import AccountDetails from 'components/Accounts/AccountDetails/AccountDetails';
import CampaignList from 'components/Campaigns/CampaignList/CampaignList';

export default class AccountsViewPage extends Component {	
	componentWillMount() {
		this.fetchAccountDetails(this.props);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.params.accountId !== this.props.params.accountId) {
			this.fetchAccountDetails(nextProps);
		}
	}

	render() {
		return (
			<div>
				<div>
					<AccountDetails Account={this.props.Account}/>
					<br/>
					<br/>
					<strong>Campaigns</strong>
					<CampaignList campaignRows={this.props.Campaign.campaignRows}
								 isFetchingCampaigns={this.props.Campaign.isFetchingCampaigns}/>
				</div>
			</div>
		);
	}

	fetchAccountDetails(props){
		const { dispatch } = props;
		const data = props.Account.accountDetails;
		const accountId = parseInt(props.params.accountId, 10);

		updateDocTitle('Account View');

		dispatch(fetchAccountView(accountId)).then(() => {
			pageVisit('Account - ' + this.props.Account.accountDetails.name, this);
			dispatch(fetchCampaigns(this.props.Account.accountDetails.id));
		});
	}
}

AccountsViewPage.propTypes = {
  	
};

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
	return {
		Account: state.Account,
		Campaign: state.Campaign,
		App: state.App
	};
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AccountsViewPage);
