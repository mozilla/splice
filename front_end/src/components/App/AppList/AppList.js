import React, { Component, PropTypes } from 'react';
import AccountList from 'components/Accounts/AccountList/AccountList';

export default class AppList extends Component {
	render() {
		return (
			<div>
				<select onChange={(e) => this.selectType(e)}>
					<option>Accounts</option>
					<option>Campaigns</option>
					<option>Ad Groups</option>
					<option>Tiles</option>
				</select>
				<AccountList accountRows={this.props.Account.accountRows}
							 isFetchingAccounts={this.props.Account.isFetchingAccounts}/>
			</div>
		);
	}

	selectType(e){

	}
}

AppList.propTypes = {
	Account: PropTypes.object.isRequired,
	App: PropTypes.object.isRequired
};
