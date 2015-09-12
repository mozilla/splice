import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Nav extends Component {
	render() {
		return (
			<div className="navbar navbar-default">
				<div className="container">
					<ul className="nav navbar-nav">
						<li className={this.props.location.pathname === '/accounts' ? 'active' : ''}><Link to="/accounts">Profiles</Link></li>
						<li className={this.props.location.pathname === '/campaigns' ? 'active' : ''}><Link to="/campaigns">Campaigns</Link></li>
						<li className={this.props.location.pathname === '/ad_groups' ? 'active' : ''}><Link to="/ad_groups">Ad Groups</Link></li>
						<li className={this.props.location.pathname === '/tiles' ? 'active' : ''}><Link to="/tiles">Tiles</Link></li>
					</ul>
				</div>
			</div>
		);
	}
}
