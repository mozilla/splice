import React, { Component, PropTypes } from 'react';
import AccountRow from './AccountRow';

export default class AccountList extends Component {
	render() {
		const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

		let rows;
		let spinner;
		if (this.props.isFetching === false) {
			rows = this.props.rows.map((row, index) =>
					<AccountRow {...row} key={index}/>
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
						<th>Name</th>
						<th>Email</th>
						<th>Phone</th>
						<th>Created</th>
					</tr>
					</thead>
					<ReactCSSTransitionGroup component="tbody" transitionName="fade" transitionLeave={false} >
						{rows}
					</ReactCSSTransitionGroup>
				</table>
				{spinner}
			</div>
		);
	}
}

AccountList.propTypes = {
	rows: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string.isRequired,
		email: PropTypes.string.isRequired,
		phone: PropTypes.string.isRequired
	}).isRequired).isRequired
};
