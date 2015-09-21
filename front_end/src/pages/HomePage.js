import React, { Component } from 'react/addons';
import { connect } from 'react-redux';

import { updateDocTitle, listTypeSelect } from 'actions/App/AppActions';
import { fetchAccounts } from 'actions/Accounts/AccountActions';
import { fetchCampaigns } from 'actions/Campaigns/CampaignActions';
import { fetchRecentlyViewed } from 'actions/App/RecentlyViewedActions';

import AccountList from 'components/Accounts/AccountList/AccountList';
import AppList from 'components/App/AppList/AppList';
import RecentlyViewedList from 'components/App/RecentlyViewed/RecentlyViewedList';

export default class HomePage extends Component {
	componentDidMount() {
		updateDocTitle('Home');

		const { dispatch } = this.props;
		if (this.props.Account.accountRows.length === 0) {
			this.props.dispatch(fetchAccounts());
		}
		dispatch(fetchRecentlyViewed());
	}

	render() {
		return (
			<div>
				<div className="row">
					<div className="col-md-12">
						<h1>Dashboard <i className="fa fa-firefox"></i></h1>
					</div>
				</div>
				<div className="row" style={{marginBottom: '25px'}}>
					<div className="col-md-9" >
						<div style={{height: '250px', border: '1px solid #666'}}>Bar Graph</div>
					</div>
					<div className="col-md-3">
						<RecentlyViewedList recentlyViewedRows={this.props.App.recentlyViewed}/>
					</div>
				</div>
				<div className="row">
					<div className="col-md-12" >
						<AppList Account={this.props.Account}
								 App={this.props.App}
								 handleListTypeSelect={value => this.handleListTypeSelect(value)}/>
					</div>
				</div>
			</div>
		);
	}

	handleListTypeSelect(value){
		this.props.dispatch(listTypeSelect(value));
		switch (value){
			case 'accounts':
				this.props.dispatch(fetchAccounts());
				break;
			case 'campaigns':
				//this.props.dispatch(fetchCampaigns());
				break;
			default:
				break;
		}
	}
}

HomePage.propTypes = {};

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
	return {
		Account: state.Account,
		App: state.App
	};
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(HomePage);
