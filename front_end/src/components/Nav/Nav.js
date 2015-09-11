import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Nav extends Component {
	render() {
		return (
			<div className="navbar navbar-default">
				<div className="container">
					<ul className="nav navbar-nav">
						<li className={this.props.location.pathname === '/' ? 'active' : ''}><Link to="/">Home</Link></li>
	          			<li className={this.props.location.pathname === '/accounts' ? 'active' : ''}><Link to="/accounts">Accounts</Link></li>
	          			<li className={this.props.location.pathname === '/campaigns' ? 'active' : ''}><Link to="/campaigns">Campaigns</Link></li>
					</ul>
				</div>
			</div>	
		);
	}
}
