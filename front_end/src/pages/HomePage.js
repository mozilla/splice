import React, { Component } from 'react';
import { connect } from 'react-redux';

import { updateDocTitle } from 'actions/App/AppActions';
import { fetchAccounts, fetchAccountStats } from 'actions/Accounts/AccountActions';
import { fetchCampaigns } from 'actions/Campaigns/CampaignActions';
import { fetchRecentlyViewed } from 'actions/App/RecentlyViewedActions';

import AccountList from 'components/Accounts/AccountList/AccountList';
import AppList from 'components/App/AppList/AppList';
import RecentlyViewedList from 'components/App/RecentlyViewed/RecentlyViewedList';

export default class HomePage extends Component {
  componentDidMount() {
    updateDocTitle('Home');

    this.props.dispatch(fetchRecentlyViewed());
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-xs-3">
            <RecentlyViewedList recentlyViewedRows={this.props.App.recentlyViewed}/>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <AppList Account={this.props.Account}
                     App={this.props.App}
                     />
          </div>
        </div>
      </div>
    );
  }
}

HomePage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Account: state.Account,
    App: state.App
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(HomePage);
