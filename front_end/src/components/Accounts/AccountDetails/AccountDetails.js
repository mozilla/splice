import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export default class AccountDetails extends Component {
	render() {
		const data = this.props.Account.details;

		let details;
		if (this.props.Account.isFetching === false) {
			details = (
				<div className="panel panel-default">
					<div className="panel-heading">Account - {data.name}
						<Link to={'/accounts/edit/' + data.id}> <i className="fa fa-pencil"></i></Link>
					</div>
					<div className="panel-body">
						<p>Account ID: {data.id}</p>
						<p>{data.phone}</p>
						<p>{data.email}</p>
						<p>Account Currency:</p>
					</div>
				</div>
			);
		} else {
			details = <img src="./public/img/ajax-loader.gif"/>;
		}

		return (<div>{details}</div>);
	}
}

AccountDetails.propTypes = {
	Account: PropTypes.object.isRequired
};
