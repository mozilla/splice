import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { formatPsDateTime } from 'helpers/ViewHelpers';

export default class TileRow extends Component {
	render() {
		//console.log(this.props.id);
		return (
			<tr>
				<td>{this.props.id}</td>
				<td><Link to={'/tiles/' + this.props.id}>{this.props.title}</Link></td>
				<td>{_.capitalize(this.props.type)}</td>
				<td>{(this.props.paused) ? 'Paused' : 'Active'}</td>
				<td>{_.capitalize(this.props.status)}</td>
				<td>{formatPsDateTime(this.props.created_at, 'M/D/YYYY')}</td>
			</tr>
		);
	}
}

TileRow.propTypes = {
	id: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
	created_at: PropTypes.string.isRequired
};
