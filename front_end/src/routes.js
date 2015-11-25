/* eslint react/self-closing-comp:0 */

import React, { Component } from 'react';
import { Router, Route, IndexRoute } from 'react-router';
import { connect } from 'react-redux';
import { formSaved, saveLocationLog } from 'actions/App/AppActions';
import createHistory from 'history/lib/createHashHistory';
import Cookie from 'react-cookie';

// Use _key instead of _k.
const history = createHistory({
  queryKey: false
});

import {
  AppPage,
  HomePage,
  AccountsPage,
  AccountViewPage,
  AccountCreatePage,
  AccountEditPage,
  CampaignsPage,
  CampaignViewPage,
  CampaignCreatePage,
  CampaignEditPage,
  CampaignBulkUploadPage,
  AdGroupsPage,
  AdGroupViewPage,
  AdGroupCreatePage,
  AdGroupEditPage,
  TilesPage,
  TileViewPage,
  TileCreatePage,
  TileEditPage,
  ApprovalsPage,
  Reporting,
  Error404Page
} from './pages/index';

export default class App extends Component {
  render() {
    return (
      <Router history={history} onUpdate={() => this.handleRouteChange()}>
        <Route path="/" component={AppPage}>
          <IndexRoute title="Home" component={HomePage}></IndexRoute>

          <Route path="accounts" title="Accounts" component={AccountsPage}></Route>
          <Route path="accounts/create" title="Create Account" component={AccountCreatePage}></Route>
          <Route path="accounts/:accountId" title="Account View" component={AccountViewPage}></Route>
          <Route path="accounts/:accountId/Edit" title="Account Edit" component={AccountEditPage}></Route>
          <Route path="accounts/:accountId/createcampaign" title="Campaign Create" component={CampaignCreatePage}></Route>

          <Route path="campaigns" title="Campaigns" component={CampaignsPage}></Route>
          <Route path="campaigns/create" title="Campaign Create" component={CampaignCreatePage}></Route>
          <Route path="campaigns/:campaignId" title="Campaign View" component={CampaignViewPage}></Route>
          <Route path="campaigns/:campaignId/Edit" title="Campaign Edit" component={CampaignEditPage}></Route>
          <Route path="campaigns/:campaignId/bulkupload" title="Campaign Bulk Upload" component={CampaignBulkUploadPage}></Route>
          <Route path="campaigns/:campaignId/createadgroup" title="Ad Group Create" component={AdGroupCreatePage}></Route>

          <Route path="adgroups" title="Ad Groups" component={AdGroupsPage}></Route>
          <Route path="adgroups/create" title="Ad Group Create" component={AdGroupCreatePage}></Route>
          <Route path="adgroups/:adGroupId" title="Ad Group View" component={AdGroupViewPage}></Route>
          <Route path="adgroups/:adGroupId/Edit" title="Ad Group Edit" component={AdGroupEditPage}></Route>
          <Route path="adgroups/:adGroupId/createtile" title="Tile Create" component={TileCreatePage}></Route>

          <Route path="tiles" title="Tiles" component={TilesPage}></Route>
          <Route path="tiles/create" title="Tile Create" component={TileCreatePage}></Route>
          <Route path="tiles/:tileId" title="Tile View" component={TileViewPage}></Route>
          <Route path="tiles/:tileId/Edit" title="Tile Edit" component={TileEditPage}></Route>

          <Route path="approvals" title="Approval Queue" component={ApprovalsPage}></Route>

          <Route path="reporting" title="Reporting" component={Reporting}>
            <IndexRoute title="Reporting | Reports" component={require('./pages/Reporting/Reporting-Reports')} />
          </Route>

          <Route path="error404" title="Page Not Found" component={Error404Page}></Route>
          <Route path="*" component={Error404Page}/>
        </Route>
      </Router>
    );
  }

  handleRouteChange(){
    window.scrollTo(0, 0);

    if(this.props.App.formChanged === true){
      this.props.dispatch(formSaved());
    }

    this.logLocation();
  }

  logLocation(){
    const limit = 5;

    let url = window.location.hash;
    url = url.replace('#', '');

    let log = this.props.App.locationLog;
    if (log === undefined) {
      log = [];
    }
    else{
      if(log[0] !== url){
        log.unshift(url);
      }
    }

    if (log.length > limit) {
      log = log.slice(0, limit);
    }

    this.props.dispatch(saveLocationLog(log));
  }
}

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    App: state.App
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(App);
