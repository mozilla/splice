import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Nav extends Component {
	render() {
		let accountId = '';
		if(this.props.Account.accountDetails.id !== undefined){
			accountId = this.props.Account.accountDetails.id;
		}
		else if(this.props.location.query.accountId !== undefined){
			accountId = this.props.location.query.accountId;
		}

		let className = 'navbar navbar-default ';
		if(!this.props.location.pathname.match(/\/accounts.*/) &&
			!this.props.location.pathname.match(/\/campaigns.*/) &&
			!this.props.location.pathname.match(/\/adgroups.*/) &&
			!this.props.location.pathname.match(/\/tiles.*/)){
			className += 'hide';
		}

		return (
			<div className={className}>
				<div className="container">
					<ul className="nav navbar-nav">
						<li className={this.props.location.pathname.match(/\/accounts.*/) ? 'active' : ''}><Link to={'/accounts/' + accountId}>Profile</Link></li>
						<li className={this.props.location.pathname === '/campaigns' ? 'active' : ''}><Link to={'/campaigns?accountId=' + accountId}>Campaigns</Link></li>
						<li className={this.props.location.pathname === '/adgroups' ? 'active' : ''}><Link to={'/adgroups?accountId=' + accountId}>Ad Groups</Link></li>
						<li className={this.props.location.pathname === '/tiles' ? 'active' : ''}><Link to={'/tiles?accountId=' + accountId}>Tiles</Link></li>
					</ul>
				</div>
			</div>
		);
	}
}
