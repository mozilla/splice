import React, { PropTypes, Component } from 'react/addons';
import { connect } from 'react-redux';

import { fetchAccounts } from 'actions/Accounts/AccountActions';

import TopBar from 'components/App/Navigation/TopBar.js';
import SideBar from 'components/App/Navigation/SideBar.js';

export default class AppPage extends Component {
	componentDidMount() {
		const { dispatch } = this.props;
		if (this.props.Account.accountRows.length === 0) {
			dispatch(fetchAccounts());
		}
	}

	render() {
		return (
			<div>
				<TopBar {...this.props} />

				<div className="container">
					<SideBar accountRows={this.props.Account.accountRows}/>

					<div className="col-md-9">
						{this.props.children}
					</div>
				</div>
			</div>
		);
	}
}

AppPage.propTypes = {};

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
	return {
		Account: state.Account,
		App: state.App
	};
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(AppPage);
