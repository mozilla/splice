import React, { Component } from '../../../node_modules/react/addons';
import { connect } from 'react-redux';
import { pageVisit } from 'actions/App/AppActions';
import { getAccountId } from 'helpers/AppHelpers';

export default class AdGroupsPage extends Component {
	componentDidMount() {
		const { dispatch } = this.props;

		pageVisit('Ad Groups', this);

		const accountId = getAccountId(this.props);
	}

	render() {
		return (
			<div>
				<h1>Ad Groups</h1>
			</div>
		);
	}
}

AdGroupsPage.propTypes = {};

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
	return {
		Account: state.Account,
		AdGroup: state.AdGroup
	};
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AdGroupsPage);


