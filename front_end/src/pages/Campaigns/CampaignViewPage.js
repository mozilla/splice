import React, { Component } from 'react/addons';

import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle, pageVisit } from 'actions/App/AppActions';

import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

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
          <div className="col-xs-12">
            <h1>Campaign</h1>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-6">
            <CampaignDetails Campaign={this.props.Campaign}/>
          </div>
          <div className="col-xs-6">
            <div className="pull-right">
              <Link className="btn btn-default" to={'/campaigns/' + this.props.Campaign.details.id + '/bulkupload'}>Bulk Upload <i className="fa fa-upload"></i></Link>
            </div>
          </div>
        </div>
        <br/>
        <div><strong>Ad Groups</strong></div>
        <AdGroupList rows={this.props.AdGroup.rows}
                     isFetching={this.props.AdGroup.isFetching}/>
      </div>
    );
  }

  fetchCampaignDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Campaign View');

    dispatch(fetchHierarchy('campaign', props)).then(() => {
      pageVisit('Campaign - ' + this.props.Campaign.details.name, this);
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
