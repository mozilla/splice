import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { formatDate } from 'helpers/DateHelpers';

export default class TileRow extends Component {
	render() {
		//console.log(this.props.id);
		return (
			<tr>
				<td>{this.props.id}</td>
				<td><Link to={'/tiles/' + this.props.id}>{(this.props.title) ? this.props.title : '(No Title)' }</Link></td>
				<td>{_.capitalize(this.props.type)}</td>
				<td className={'status ' + ((this.props.paused) ? 'paused' : 'active')}>{(this.props.paused) ? 'Paused' : 'Active'}</td>
				<td className={'status ' + this.props.status}>{_.capitalize(this.props.status)}</td>
				<td>{formatDate(this.props.created_at, 'YYYY-MM-DD')}</td>
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
