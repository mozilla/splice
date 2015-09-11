import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export default class RecentlyViewedRow extends Component {
	render() {
		return (
			<tr>
				<td><Link to={this.props.url}>{this.props.title}</Link></td>
			</tr>
		);
	}
}

RecentlyViewedRow.propTypes = {
	title: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired
};
