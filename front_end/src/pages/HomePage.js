import React, { Component } from 'react/addons';
import { connect } from 'react-redux';

import { fetchAccounts } from 'actions/Accounts/AccountActions';
import { fetchRecentlyViewed, fileUploaded } from 'actions/AppActions';
import AccountList from 'components/Accounts/AccountList/AccountList';
import RecentlyViewedList from 'components/App/RecentlyViewed/RecentlyViewedList';

export default class HomePage extends Component {
	componentDidMount() {
		const { dispatch } = this.props;
		if (this.props.Account.accountRows.length === 0) {
			dispatch(fetchAccounts());
		}

		dispatch(fetchRecentlyViewed());
	}

	render() {
		const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

		return (
			<div>
				<ReactCSSTransitionGroup transitionName="fadeIn" transitionAppear={true}>
					<div className="row">
						<h1>Dashboard</h1>
					</div>
					<div className="row">
						<div className="col-md-9" style={{height: '250px', border: '1px solid #666'}}>
							Bar Graph
						</div>
						<div className="col-md-3">
							<RecentlyViewedList recentlyViewedRows={this.props.App.recentlyViewed}/>
						</div>
					</div>
					<div className="row">
						<div className="col-md-12" >
							<div><strong>Accounts</strong></div>
							<AccountList accountRows={this.props.Account.accountRows}
										 isFetchingAccounts={this.props.Account.isFetchingAccounts}/>
						</div>
					</div>
				</ReactCSSTransitionGroup>
			</div>
		);
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
