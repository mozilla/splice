import React, { Component } from 'react';

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
    let output = (<div/>);

    if(this.props.Campaign.details){
      output = (
        <div>
          <div className="row">
            <div className="col-xs-6">
              <CampaignDetails Campaign={this.props.Campaign} Init={this.props.Init}/>
            </div>
          </div>
          <Link className="create-link" to={'/campaigns/' + this.props.Campaign.details.id + '/createadgroup'}>Create Ad Group <i className="fa fa-plus"></i></Link>
          <Link className="upload-link create-link" to={'/campaigns/' + this.props.Campaign.details.id + '/bulkupload'}>Bulk Upload <i className="fa fa-upload"></i></Link>
          <AdGroupList rows={this.props.AdGroup.rows}
                       isFetching={this.props.AdGroup.isFetching}/>
        </div>
      );
    }

    return output;
  }

  fetchCampaignDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Campaign View');

    dispatch(fetchHierarchy('campaign', props))
      .catch(function(){
        props.history.replaceState(null, '/error404');
      })
      .then(() => {
        if(this.props.Campaign.details) {
          pageVisit('Campaign - ' + this.props.Campaign.details.name, this);
        }
    });
  }
}

CampaignViewPage.propTypes = {};

function select(state) {
  return {
    Account: state.Account,
    Campaign: state.Campaign,
    AdGroup: state.AdGroup,
    Init: state.Init
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(CampaignViewPage);
