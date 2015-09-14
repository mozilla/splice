import React, { Component } from 'react';
import { Link } from 'react-router';

export default class SideBar extends Component {
	render() {
		let accountLinks;
		if (_.isEmpty(this.props.accountRows) === false) {
			accountLinks = this.props.accountRows.map((row, index) =>
				<li key={'sidebar' + index}><Link to={'/accounts/' + row.id }>{row.name}</Link></li>
			);
		} else {
			accountLinks = '';
		}

		return (
			<div className="sidebar col-md-3">
				<div>
					Accounts
					<ul className="">
						{accountLinks}
					</ul>
				</div>

				<div> Create +</div>
				<div> Approval Queue</div>
			</div>
		);
	}
}
