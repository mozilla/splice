import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Moment from 'moment';

export default class CampaignRow extends Component {
	render() {
		//console.log(this.props.id);
		return (
			<tr>
				<td>{this.props.id}</td>
				<td><Link to={'/campaigns/' + this.props.id}>{this.props.name}</Link></td>
				<td>{this.props.status}</td>
				<td>{Moment(this.props.created_at, 'dddd, D MMM YYYY HH:mm:ss ZZ').format('M/D/YYYY h:mma')}</td>
			</tr>
		);
	}
}

CampaignRow.propTypes = {
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	status: PropTypes.string.isRequired,
	created_at: PropTypes.string.isRequired
};
