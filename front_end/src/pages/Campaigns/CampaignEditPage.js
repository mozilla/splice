import React, { Component } from 'react/addons';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle, displayMessage, shownMessage } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';
import { updateCampaign } from 'actions/Campaigns/CampaignActions';
import Moment from 'moment';

import CampaignForm from 'components/Campaigns/CampaignForm/CampaignForm';

window.$ = require('jquery');
require('jquery-serializejson');

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
              ? <CampaignForm isSaving={this.props.Campaign.isSaving} handleFormSubmit={(id) => this.handleFormSubmit(id)} data={this.props.Campaign.details} editMode={true} />
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

  handleFormSubmit(id){
    const { dispatch } = this.props;
    const props = this.props;
    const context = this;
    //let error = null;

    const formData = $(id).serializeJSON();
    if(formData.start_date.trim() !== ''){
      //formData.start_date = Moment(formData.start_date).unix();
    }
    if(formData.end_date.trim() !== ''){
      //formData.end_date = Moment(formData.end_date).unix();
    }
    delete formData.start_date;
    delete formData.end_date;
    formData.paused = false;

    const data = JSON.stringify(formData);

    dispatch(updateCampaign(this.props.Campaign.details.id, data))
      .then(function(response){
        if(response.result === undefined){
          if(_.isString(response.message)){
            dispatch(displayMessage('error', 'Error: ' + response.message) );
          }
          else{
            dispatch(displayMessage('error', 'Error: Validation Errors') );
          }
          dispatch(shownMessage());
        }
        else{
          dispatch(displayMessage('success', 'Campaign Updated Successfully') );
          dispatch(shownMessage());
        }
      }
    );
  }
}

CampaignEditPage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Campaign: state.Campaign,
    Account: state.Account
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(CampaignEditPage);
