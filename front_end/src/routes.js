/* eslint react/self-closing-comp:0 */

import React, { Component } from 'react';
import { Router, Route } from 'react-router';
import createHistory from 'history/lib/createHashHistory';
// Use _key instead of _k.
const history = createHistory({
	queryKey: false
});

import {
	AppPage,
	HomePage,
	AccountsPage,
	AccountViewPage,
	AccountsAddPage,
	CampaignsPage
} from './pages/index';

export default class App extends Component {
	render() {
		return (
			<Router history={history}>
				<Route component={AppPage}>
					<Route path="/" title="Home" component={HomePage}></Route>

					<Route path="/accounts" title="Accounts" component={AccountsPage}></Route>
					<Route path="/accounts/add" title="Account Add" component={AccountsAddPage}></Route>
					<Route path="/accounts/:accountId" title="Account View" component={AccountViewPage}></Route>

					<Route path="/campaigns" title="Campaigns" component={CampaignsPage}></Route>
				</Route>
			</Router>
		);
	}
}
