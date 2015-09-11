import React, { Component, PropTypes } from 'react';
import RecentlyViewedRow from './RecentlyViewedRow';

export default class RecentlyViewedList extends Component {
	render() {
		let rows;
		if (this.props.recentlyViewedRows !== undefined && this.props.recentlyViewedRows.length > 0) {
			rows = this.props.recentlyViewedRows.map((recentlyViewedRow, index) =>
					<RecentlyViewedRow {...recentlyViewedRow} key={index}/>
			);
		} else {
			rows = '';
		}

		return (
			<table className="table">
				<thead>
				<tr>
					<th>Recently Viewed</th>
				</tr>
				</thead>
				<tbody>
				{rows}
				</tbody>
			</table>
		);
	}
}

RecentlyViewedList.propTypes = {
	recentlyViewedRows: PropTypes.arrayOf(PropTypes.shape({
		title: PropTypes.string.isRequired,
		url: PropTypes.string.isRequired
	}).isRequired).isRequired
};
