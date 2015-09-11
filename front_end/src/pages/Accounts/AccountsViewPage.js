import React, { Component } from 'react/addons';

import { connect } from 'react-redux';
import _ from 'lodash';
import { Link } from 'react-router';

import { fetchAccountView } from 'actions/Accounts/AccountActions';
import { updateDocTitle, pageVisit } from 'actions/AppActions';

import AccountDetails from 'components/Accounts/AccountDetails/AccountDetails';

require('styles/Accounts/accounts.scss');

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
		const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

		return (
			<div>
				<ReactCSSTransitionGroup transitionName="fadeIn" transitionAppear={true} transitionLeave={false}>
					<div>
						<div className="pull-right">
							<Link to="/campaigns/add">Add Campaign</Link>
						</div>
						<AccountDetails Account={this.props.Account}/>
					</div>
				</ReactCSSTransitionGroup>
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
		App: state.App
	};
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AccountsViewPage);
