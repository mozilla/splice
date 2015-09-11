import React, { Component } from 'react/addons';
import { connect } from 'react-redux';

import { pageVisit } from 'actions/AppActions';
import { saveAccount, fetchAccounts } from 'actions/Accounts/AccountActions';
import AccountList from 'components/Accounts/AccountList/AccountList';
import AccountForm from 'components/Accounts/AccountAdd/AccountForm';

import { Link } from 'react-router';

require('styles/Accounts/accounts.scss');

export default class AccountsPage extends Component {
	componentDidMount() {
		pageVisit('Accounts', this);

		const { dispatch } = this.props;
		if (this.props.Account.accountRows.length === 0) {
			dispatch(fetchAccounts());
		}
	}

	render() {
		const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
		const dispatch = this.props.dispatch;

		return (
			<div>
				<ReactCSSTransitionGroup transitionName="fadeIn" transitionAppear={true} transitionLeave={false}>
					<div>
						<h1>Accounts</h1>

						<div className="pull-right">
							<Link to="/accounts/add">Add Account</Link>
						</div>
						<AccountForm onAddClick={text => dispatch(saveAccount(text))}
									 isSavingAccount={this.props.Account.isSavingAccount}/>
						<AccountList accountRows={this.props.Account.accountRows}
									 isFetchingAccounts={this.props.Account.isFetchingAccounts}/>
					</div>
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}

AccountsPage.propTypes = {};

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
	return {
		Account: state.Account
	};
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AccountsPage);
