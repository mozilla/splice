import React, { Component, PropTypes } from 'react';
import TileRow from './TileRow';

export default class TileList extends Component {
	render() {
		const ReactCSSTransitionGroup = require('react-addons-css-transition-group');

		let rows;
		let spinner;

		if (this.props.isFetching === false) {
			rows = this.props.rows.map((row, index) =>
					<TileRow {...row} key={index}/>
			);
		} else {
			spinner = (<img src="./public/img/ajax-loader.gif"/>);
		}

		return (
			<div>
				<table className="table">
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
					<ReactCSSTransitionGroup component="tbody" transitionName="fade" transitionAppearTimeout={300} transitionEnterTimeout={300} transitionLeaveTimeout={300} >
						{rows}
					</ReactCSSTransitionGroup>
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
