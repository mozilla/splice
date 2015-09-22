import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Moment from 'moment';

export default class AccountRow extends Component {
	render() {
		//console.log(this.props.id);
		return (
			<tr>
				<td>{this.props.id}</td>
				<td><Link to={'/accounts/' + this.props.id}>{this.props.name}</Link></td>
				<td>{this.props.email}</td>
				<td>{this.props.phone}</td>
				<td>{Moment(this.props.created_at, 'dddd, D MMM YYYY HH:mm:ss ZZ').format('M/D/YYYY h:mma')}</td>
			</tr>
		);
	}
}

AccountRow.propTypes = {
	name: PropTypes.string.isRequired,
	email: PropTypes.string.isRequired,
	phone: PropTypes.string.isRequired,
	created_at: PropTypes.string.isRequired
};
