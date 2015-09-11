import React, { Component, PropTypes } from 'react';
import AccountRow from './AccountRow';

export default class AccountList extends Component {
	render() {
		let rows;
		if (this.props.isFetchingAccounts === false) {
			rows = this.props.accountRows.map((accountRow, index) =>
					<AccountRow {...accountRow} key={index}/>
			);
		} else {
			rows = (
				<tr>
					<td><img src="./public/img/ajax-loader.gif"/></td>
				</tr>
			);
		}

		return (
			<table className="table">
				<thead>
				<tr>
					<th>ID</th>
					<th>Email</th>
					<th>Phone</th>
				</tr>
				</thead>
				<tbody>{rows}

				</tbody>
			</table>
		);
	}
}

AccountList.propTypes = {
	accountRows: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string.isRequired,
		email: PropTypes.string.isRequired,
		phone: PropTypes.string.isRequired
	}).isRequired).isRequired
};
