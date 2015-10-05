import React, { Component } from 'react/addons';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle, displayMessage, shownMessage } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';
import { createCampaign } from 'actions/Campaigns/CampaignActions';
import Moment from 'moment';

import CampaignForm from 'components/Campaigns/CampaignForm/CampaignForm';

import $ from 'jquery';
window.$ = $;
require('jquery-serializejson');

export default class CampaignCreatePage extends Component {
  componentDidMount() {
    this.fetchAccountDetails(this.props);

    this.frontEndScripts();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.accountId !== this.props.params.accountId) {
      this.fetchAccountDetails(nextProps);
    }
  }

  render() {
    let spinner;
    if(this.props.Campaign.isSaving){
      spinner = <img src="/public/img/ajax-loader.gif" />;
    }

    return (
      <div>
        <h1>{this.props.Account.details.name}: Create Campaign</h1>
        <div className="panel panel-default">
          <div className="panel-body">
            <CampaignForm isSaving={this.props.Campaign.isSaving} handleFormSubmit={(id) => this.handleFormSubmit(id)} data={{account_id: this.props.Account.details.id}} editMode={false} />
          </div>
        </div>
      </div>
    );
  }

  fetchAccountDetails(props) {
    const { dispatch } = props;

    updateDocTitle('Create Campaign');

    dispatch(fetchHierarchy('account', props))
      .catch(function(){
        props.history.pushState(null, '/error404');
      })
      .then(() => {
        if(this.props.Account.details.name !== undefined){
          updateDocTitle(this.props.Account.details.name + ': Create Campaign');
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

    dispatch(createCampaign(data))
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
          dispatch(displayMessage('success', 'Campaign Created Successfully') );
          props.history.pushState(null, '/campaigns/' + response.result.id);
        }
      }
    );
  }

  frontEndScripts(){

  }
}

CampaignCreatePage.propTypes = {};

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    Campaign: state.Campaign,
    Account: state.Account
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(CampaignCreatePage);
