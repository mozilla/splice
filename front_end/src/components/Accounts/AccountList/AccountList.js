import React, { Component, PropTypes } from 'react';
import AccountRow from './AccountRow';

export default class AccountList extends Component {
	render() {
		const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

		let rows;
		let spinner;
		if (this.props.isFetchingAccounts === false) {
			rows = this.props.accountRows.map((accountRow, index) =>
					<AccountRow {...accountRow} key={index}/>
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
	accountRows: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string.isRequired,
		email: PropTypes.string.isRequired,
		phone: PropTypes.string.isRequired
	}).isRequired).isRequired
};
