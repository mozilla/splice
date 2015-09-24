import React, { Component } from 'react/addons';

import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle, pageVisit } from 'actions/App/AppActions';

import { fetchAccount } from 'actions/Accounts/AccountActions';
import { fetchCampaign, fetchCampaigns } from 'actions/Campaigns/CampaignActions';
import { fetchAdGroups } from 'actions/AdGroups/AdGroupActions';

import CampaignDetails from 'components/Campaigns/CampaignDetails/CampaignDetails';
import AdGroupList from 'components/AdGroups/AdGroupList/AdGroupList';

export default class CampaignViewPage extends Component {
  componentWillMount() {
    this.fetchCampaignDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.campaignId !== this.props.params.campaignId) {
      this.fetchCampaignDetails(nextProps);
    }
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-6">
            <h1>Campaign</h1>
            <CampaignDetails Campaign={this.props.Campaign}/>
          </div>
        </div>
        <br/>
        <strong>Ad Groups</strong>
        <AdGroupList rows={this.props.AdGroup.rows}
                     isFetching={this.props.AdGroup.isFetching}/>
      </div>
    );
  }

  fetchCampaignDetails(props) {
    const { dispatch } = props;
    const data = props.Campaign.details;
    const campaignId = parseInt(props.params.campaignId, 10);

    updateDocTitle('Campaign View');

    //Retrieve Current Campaign, parent Account and all Campaigns under the account.
    dispatch(fetchCampaign(campaignId)).then(() => {
      pageVisit('Campaign - ' + this.props.Campaign.details.name, this);
      dispatch(fetchAdGroups(this.props.Campaign.details.id));
    }).then(() => {
      dispatch(fetchAccount(this.props.Campaign.details.account_id));
      dispatch(fetchCampaigns(this.props.Campaign.details.account_id));
    });
  }
}

CampaignViewPage.propTypes = {};

function select(state) {
  return {
    Account: state.Account,
    Campaign: state.Campaign,
    AdGroup: state.AdGroup
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(CampaignViewPage);
