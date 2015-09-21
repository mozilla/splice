import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export default class CampaignRow extends Component {
	render() {
		//console.log(this.props.id);
		return (
			<tr>
				<td>{this.props.id}</td>
				<td><Link to={'/campaigns/' + this.props.id}>{this.props.name}</Link></td>
				<td>{this.props.status}</td>
				<td>{this.props.created_at}</td>
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
