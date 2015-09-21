import React, { Component } from 'react/addons';
import { pageVisit } from 'actions/App/AppActions';

export default class CampaignsPage extends Component {
	componentDidMount() {
		pageVisit('Campaigns', this);
	}

	render() {
		return (
			<div>
				<h1>Campaigns</h1>
			</div>
		);
	}
}


