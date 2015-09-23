import React, { Component } from 'react/addons';
import { connect } from 'react-redux';

import { pageVisit } from 'actions/App/AppActions';
import { saveAccount, fetchAccounts } from 'actions/Accounts/AccountActions';
import AccountList from 'components/Accounts/AccountList/AccountList';
import AccountForm from 'components/Accounts/AccountAdd/AccountForm';

import { Link } from 'react-router';

export default class AccountsPage extends Component {
	componentDidMount() {
		pageVisit('Accounts', this);

		const { dispatch } = this.props;
		if (this.props.Account.row.length === 0) {
			dispatch(fetchAccounts());
		}
	}

	render() {
		const dispatch = this.props.dispatch;

		return (
			<div>
				<div>
					<h1>Accounts</h1>

					<div className="pull-right">
						<Link to="/accounts/add">Add Account</Link>
					</div>
					<AccountForm onAddClick={text => dispatch(saveAccount(text))}
								 isSaving={this.props.Account.isSaving}/>
					<AccountList rows={this.props.Account.rows}
								 isFetching={this.props.Account.isFetching}/>
				</div>
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
