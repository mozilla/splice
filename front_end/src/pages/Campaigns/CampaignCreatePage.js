import React, { Component } from 'react/addons';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { updateDocTitle, displayMessage, shownMessage } from 'actions/App/AppActions';
import { fetchHierarchy } from 'actions/App/BreadCrumbActions';
import { createCampaign } from 'actions/Campaigns/CampaignActions';
import Moment from 'moment';

import $ from 'jquery';
window.$ = $;
require('jquery-serializejson');
require('select2');
require('select2/dist/css/select2.min.css');

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
        <h1>{this.props.Account.details.name} - Create Campaign</h1>
        <div className="panel panel-default">
          <div className="panel-body">
            <form id="CampaignForm" ref="form">
              <input type="hidden" name="account_id" ref="account_id" value={this.props.params.accountId} />
              <div className="form-group">
                <label htmlFor="CampaignName">Name</label>
                <input className="form-control" type="text" id="CampaignName" name="name" ref="name" />
              </div>
              <div className="form-group">
                <label htmlFor="CampaignStartDate">Start Date</label>
                <input className="form-control" type="text" id="CampaignStartDate" name="start_date" ref="start_date" />
              </div>
              <div className="form-group">
                <label htmlFor="CampaignEndDate">End Date</label>
                <input className="form-control" type="text" id="CampaignEndDate" name="end_date" ref="end_date" />
              </div>
              <div className="form-group">
                <label htmlFor="CampaignCountries">Countries</label><br/>
                <select className="form-control" style={{width: '100%'}} type="text" id="CampaignCountries" name="countries[]" ref="countries" multiple="multiple" >
                  <option value="STAR" >STAR</option>
                  <option value="SPACE" >SPACE</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="CampaignChannelId">Channel</label>
                <select className="form-control" id="CampaignChannelId" name="channel_id" ref="channel_id" >
                  <option value="1">1</option>
                </select>
              </div>
              <input onClick={(e) => this.handleFormSubmit(e)} type="submit" value="Submit" className="btn btn-primary"/>
              &nbsp;
              <Link to={'/accounts/' + this.props.Account.details.id} className="btn btn-default">Cancel</Link>
              &nbsp;
              {spinner}
            </form>
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
      });
  }

  handleFormSubmit(e){
    const { dispatch } = this.props;
    const props = this.props;

    e.preventDefault();
    const formData = $('#CampaignForm').serializeJSON();
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

    dispatch(createCampaign(data)).then(function(response){
      props.history.pushState(null, '/campaigns/' + response.id);
    });
  }

  handleFormSubmit(e){
    e.preventDefault();

    const { dispatch } = this.props;
    const props = this.props;
    const context = this;
    //let error = null;

    const formData = $('#CampaignForm').serializeJSON();
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
    const context = this;
    $('#CampaignForm input').keydown(function(e){
      if (e.which === 13) {
        context.handleFormSubmit(e);
      }
    });

    $('#CampaignCountries').select2();
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
