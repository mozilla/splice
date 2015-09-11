import React, { Component } from 'react';
import { Link } from 'react-router';

export default class TopBar extends Component {
	render() {
		return (
			<div className="navbar navbar-default">
				<div className="container">
					<ul className="nav navbar-nav">
						<li><Link to="/">SPLICE</Link></li>
					</ul>
				</div>
			</div>
		);
	}
}
