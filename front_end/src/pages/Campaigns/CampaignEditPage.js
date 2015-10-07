import React, { Component } from 'react/addons';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import CampaignForm from 'components/Campaigns/CampaignForm/CampaignForm';

export default class CampaignEditPage extends Component {
  componentDidMount() {
    this.fetchCampaignDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.campaignId !== this.props.params.campaignId) {
      this.fetchCampaignDetails(nextProps);
    }
  }

  render() {
    let spinner;
    if(this.props.Campaign.isSaving){
      spinner = <img src="/public/img/ajax-loader.gif" />;
    }

    return (
      <div>
        <h1>Edit Campaign - {this.props.Campaign.details.name}</h1>
        <div className="panel panel-default">
          <div className="panel-body">
            {(this.props.Campaign.details.id !== undefined)
              ? <CampaignForm editMode={true} {...this.props} />
              : null
            }
          </div>
        </div>
      </div>
    );
  }

  fetchCampaignDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Edit Campaign');

    dispatch(fetchHierarchy('campaign', props))
      .catch(function(){
        props.history.pushState(null, '/error404');
      })
      .then(() => {
        if(this.props.Campaign.details.name !== undefined){
          updateDocTitle('Edit Campaign - ' + this.props.Campaign.details.name);
        }
      });
  }
}

CampaignEditPage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Campaign: state.Campaign,
    Account: state.Account,
    Init: state.Init
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(CampaignEditPage);
