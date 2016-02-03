import React, { Component, PropTypes } from 'react';
import TileRow from './TileRow';

export default class TileList extends Component {
	render() {
		let rows;
		let spinner;

		if (this.props.isFetching === false) {
			rows = this.props.rows.map((row, index) =>
					<TileRow {...row} key={index}/>
			);
		} else {
			spinner = (<img src={__CONFIG__.WEBPACK_PUBLIC_PATH + 'public/img/ajax-loader-navy.gif'}/>);
		}

		return (
			<div className="module">
				<table className="module-table data-table">
					<thead>
					<tr>
						<th>ID</th>
						<th>Title</th>
						<th>Type</th>
						<th>Active Status</th>
						<th>Approval Status</th>
						<th>Created</th>
					</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
				{spinner}
			</div>
		);
	}
}

TileList.propTypes = {
	rows: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.number.isRequired,
		title: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		created_at: PropTypes.string.isRequired
	}).isRequired).isRequired
};
