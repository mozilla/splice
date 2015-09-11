import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export default class AccountRow extends Component {
	render() {
		//console.log(this.props.id);
		return (
			<tr>
				<td><Link to={'/accounts/' + this.props.id}>{this.props.name}</Link></td>
				<td>{this.props.email}</td>
				<td>{this.props.phone}</td>
			</tr>
		);
	}
}

AccountRow.propTypes = {
	name: PropTypes.string.isRequired,
	email: PropTypes.string.isRequired,
	phone: PropTypes.string.isRequired
};
