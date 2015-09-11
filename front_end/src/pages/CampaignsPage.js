import React, { Component } from 'react/addons';
import { pageVisit } from 'actions/AppActions';

export default class CampaignsPage extends Component {
	componentDidMount() {
		pageVisit('Campaigns', this);
	}

	render() {
		const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

		return (
			<div>
				<ReactCSSTransitionGroup transitionName="fadeIn" transitionAppear={true}>
					<h1>Campaigns</h1>
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}


