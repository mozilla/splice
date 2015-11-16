import React, { Component } from 'react';
import { connect } from 'react-redux';
import reactMixin from 'react-mixin';
import { Link, Lifecycle } from 'react-router';

import { updateDocTitle } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';

import CampaignForm from 'components/Campaigns/CampaignForm/CampaignForm';

@reactMixin.decorate(Lifecycle)
class CampaignEditPage extends Component {
  constructor(props) {
    super(props);
    this.routerWillLeave = this.routerWillLeave.bind(this);
  }

  componentDidMount() {
    this.fetchCampaignDetails(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.campaignId !== this.props.params.campaignId) {
      this.fetchCampaignDetails(nextProps);
    }
  }

  render() {
    let output = null;

    if(this.props.Campaign.details){
      output = (
        <div>
          <div className="form-module">
            <div className="form-module-header">Edit Campaign - {this.props.Campaign.details.name}</div>
            <div className="form-module-body">
              {(this.props.Campaign.details.id && this.props.Init.countries.length)
                ? <CampaignForm editMode={true} {...this.props} />
                : null
              }
            </div>
          </div>
        </div>
      );
    }

    return output;
  }

  routerWillLeave() {
    if(this.props.App.formChanged){
      return 'Your progress is not saved. Are you sure you want to leave?';
    }
  }

  fetchCampaignDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Edit Campaign');

    dispatch(fetchHierarchy('campaign', props))
      .catch(function(){
        props.history.replaceState(null, '/error404');
      })
      .then(() => {
        if(this.props.Campaign.details){
          updateDocTitle('Edit Campaign - ' + this.props.Campaign.details.name);
        }
      });
  }
}

CampaignEditPage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    App: state.App,
    Campaign: state.Campaign,
    Account: state.Account,
    Init: state.Init
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(CampaignEditPage);
