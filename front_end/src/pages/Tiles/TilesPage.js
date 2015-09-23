import React, { Component } from '../../../node_modules/react/addons';
import { connect } from 'react-redux';
import { pageVisit } from 'actions/App/AppActions';
import { getAccountId } from 'helpers/AppHelpers';

export default class TilesPage extends Component {
	componentDidMount() {
		const { dispatch } = this.props;

		pageVisit('Tiles', this);

		const accountId = getAccountId(this.props);
	}

	render() {
		return (
			<div>
				<h1>Tiles</h1>
			</div>
		);
	}
}

TilesPage.propTypes = {};

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
	return {
		Account: state.Account,
		Tile: state.Tile
	};
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(TilesPage);


