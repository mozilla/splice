import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export default class AccountDetails extends Component {
	render() {
		const data = this.props.Account.accountDetails;

		let details;
		let subtitle;
		if (this.props.Account.isFetchingAccountView === false) {
			details = (
				<div className="accound-details">
					<div><strong>Account <span> - {data.name}</span></strong></div>
					<div>Account ID: {data.id}</div>

					<div>{data.phone}</div>
					<div>{data.email}</div>

					<div>Account Currency:</div>
					<div><Link to={'/accounts/edit/' + data.id}>Edit</Link></div>
				</div>
			);
		} else {
			details = <div><img src="./public/img/ajax-loader.gif"/></div>;
		}

		return (<div>{details}</div>);
	}
}

AccountDetails.propTypes = {
	Account: PropTypes.object.isRequired
};
