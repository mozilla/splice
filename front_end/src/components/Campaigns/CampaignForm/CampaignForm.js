import React, { Component, PropTypes } from 'react';

import { displayMessage, shownMessage, formChanged, formSaved } from 'actions/App/AppActions';
import { createCampaign, updateCampaign, campaignSetDetailsVar} from 'actions/Campaigns/CampaignActions';
import { bindFormValidators, bindFormConfig } from 'helpers/FormValidators';
import { formatDate, apiDate } from 'helpers/DateHelpers';
import CustomRadio from 'components/Forms/CustomRadio/CustomRadio';
import Moment from 'moment';
import ReactSelect from 'react-select';

window.$ = require('jquery');
window.jQuery = $;
require('react-select/dist/react-select.min.css');
require('eonasdan-bootstrap-datetimepicker');
require('eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css');
require('jquery-serializejson');

bindFormConfig();
require('parsleyjs');

export default class CampaignForm extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  componentDidMount() {
    bindFormValidators();
    this.frontEndScripts();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.Campaign.details.id !== this.props.Campaign.details.id ||
        prevProps.Account.details.id !== this.props.Account.details.id ){
      bindFormValidators();
    }
    this.frontEndScripts();
    $('.Select input[type="hidden"]').trigger('keyup');
  }

  render() {
    let spinner;
    if(this.props.Campaign.isSaving){
      spinner = <img src="/public/img/ajax-loader-aqua.gif" />;
    }

    const data = this.props.Campaign.details;

    const accounts = [];
    const countries = [];

    if(data.account_id === undefined && this.props.params.accountId !== undefined){
      data.account_id = this.props.params.accountId;
    }
    else if(this.props.Account.rows !== undefined) {
      this.props.Account.rows.map((row, index) =>
        accounts.push({value: row.id, label: row.name})
      );
    }

    if (this.props.Init.countries !== undefined) {
      this.props.Init.countries.map((row, index) =>
        countries.push({value: row.country_code, label: row.country_name})
      );
    }

    return (
      <div>
        <form id="CampaignForm" ref="form" key={'campaignform-' + ((this.props.editMode) ? 'edit-' + data.id : 'create' )}>
          {(this.props.editMode) ? (<input type="hidden" name="id" ref="id" value={data.id}/>) : null}

          <div className="container-fluid field-container">
            {(this.props.editMode === false && this.props.params.account_id === undefined) ?
                <div>
                  <div className="row">
                    <div className="col-xs-4">
                      <div className="form-group">
                        <label htmlFor="AccountId">Account</label>
                        <ReactSelect
                          className="account-select"
                          name="account_id"
                          value={data.selected_account_id}
                          options={accounts}
                          onChange={(id, option) => this.handleSelectAccount(id, option)}
                          placeholder=""
                          clearable={false}
                          inputProps={{
                          'id': 'AccountId',
                          'data-parsley-excluded': true
                        }}
                        />
                      </div>
                    </div>
                  </div>
                  <hr/>
                </div>
              : <input type="hidden" name="account_id" ref="account_id" value={data.account_id} />
            }

            <div className="row">
              <div className="col-xs-4">
                {(this.props.editMode)
                  ? (<div className="form-group">
                  <label htmlFor="AccountPaused">Paused</label>
                  <div className="onoffswitch">
                    <input type="checkbox" onChange={this.handleChange} name="paused" ref="paused" className="onoffswitch-checkbox" id="AccountPaused" defaultChecked={data.paused} value="true"/>
                    <label className="onoffswitch-label" htmlFor="AccountPaused"></label>
                  </div>
                </div>)
                  : <input type="hidden" name="paused" ref="paused" value={false}/>
                }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-4">
                <div className="form-group">
                  <label htmlFor="CampaignName">Campaign Name</label>
                  <input className="form-control" type="text" onChange={this.handleChange}  id="CampaignName" name="name" ref="name" defaultValue={data.name} data-parsley-required data-parsley-minlength="2"/>
                </div>
              </div>
              <div className="col-xs-4 col-xs-push-3">
                <div className="form-group">
                  <label htmlFor="CampaignChannelId">How do you want to reach people?</label>
                  <CustomRadio inputName="channel_id" selected={this.props.Campaign.details.channel_id} options={this.props.Init.channels} handleChange={this.handleChange} />
                </div>
              </div>
            </div>
            <hr/>
            <div className="row">
              <div className="col-xs-12">
                <h3 className="form-section-header">Audience</h3>
              </div>
            </div>
            <div className="row">
              <div className="col-xs-6">
                <div className="form-group">
                  <label htmlFor="CampaignCountries">Countries</label><br/>
                  <ReactSelect
                    className="countries-select"
                    name="countries[]"
                    value={data.countries}
                    multi={true}
                    options={countries}
                    onChange={(id, options) => this.handleMultiSelect(id, options, 'countries')}
                    placeholder=""
                    clearable={false}
                    inputProps={{
                      'id': 'CampaignCountries',
                      'data-parsley-excluded': true
                    }}
                  />
                </div>
              </div>
            </div>
            <hr/>
            <div className="row">
              <div className="col-xs-12">
                <h3 className="form-section-header">Scheduling</h3>
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <div className="form-group">
                  <label htmlFor="CampaignStartDate">Start Date</label>
                  <input className="form-control" type="text" onChange={this.handleChange} id="CampaignStartDate" name="start_date" ref="start_date" defaultValue={formatDate(data.start_date, 'YYYY-MM-DD')} data-parsley-dateformat data-parsley-required />
                </div>
              </div>
              <div className="col-xs-3">
                <div className="form-group">
                  <label htmlFor="CampaignEndDate">End Date</label>
                  <input className="form-control" type="text" onChange={this.handleChange} id="CampaignEndDate" name="end_date" ref="end_date" defaultValue={formatDate(data.end_date, 'YYYY-MM-DD')} data-parsley-dateformat data-parsley-required />
                </div>
              </div>
            </div>
          </div>

          <button onClick={this.handleFormSubmit} className="form-submit" >Save {spinner}</button>

        </form>
      </div>
    );
  }

  frontEndScripts(){
    const context = this;

    const options = {
      useCurrent: true,
      format: 'YYYY-MM-DD',
      showTodayButton: true
    };
    $('#CampaignStartDate, #CampaignEndDate').datetimepicker(options).blur(function(){
      context.handleChange();
    });
  }

  handleSelectAccount(id, option){
    this.props.dispatch(campaignSetDetailsVar('selected_account_id', id));
    this.handleChange();
  }

  handleMultiSelect(id, options, varName){
    this.props.dispatch(campaignSetDetailsVar(varName, options));
    this.handleChange();
  }

  handleChange(){
    if(this.props.App.formChanged !== true){
      this.props.dispatch(formChanged());
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();

    $('input[name="account_id"]')
      .attr('data-parsley-required', 'true');
    $('input[name="countries[]"]')
      .attr('data-parsley-required', 'true')
      .attr('data-parsley-mincheck', '1');

    const form = $('#CampaignForm').parsley();

    if(form.validate()){
      const formData = $('#CampaignForm').serializeJSON();

      formData.countries = $('input[name="countries[]"]').val().split(',');

      if(formData.start_date.trim() !== ''){
        formData.start_date = apiDate(formData.start_date);
      }
      if(formData.end_date.trim() !== ''){
        formData.end_date = apiDate(formData.end_date);
      }

      const data = JSON.stringify(formData);

      //Handle Update or Create
      if(this.props.editMode){
        this.handleUpdate(data);
      }
      else{
        this.handleCreate(data);
      }
    }
    else{
      const { dispatch } = this.props;
      dispatch(displayMessage('error', 'Validation Errors') );
      dispatch(shownMessage());
      window.scrollTo(0, 0);
    }
  }

  handleCreate(data){
    const { dispatch } = this.props;
    const context = this;

    dispatch(createCampaign(data))
      .then(function(response){
        context.handleResponse(response);
      }
    );
  }

  handleUpdate(data){
    const { dispatch } = this.props;
    const context = this;

    dispatch(updateCampaign(this.props.Campaign.details.id, data))
      .then(function(response){
        context.handleResponse(response);
      });
  }

  handleResponse(response){
    const { dispatch, history } = this.props;

    if(response.result === undefined){
      dispatch(displayMessage('error', response.message) );
      dispatch(shownMessage());
      window.scrollTo(0, 0);
    }
    else{
      if(this.props.editMode){
        dispatch(displayMessage('success', 'Campaign Updated Successfully') );
      }
      else{
        dispatch(displayMessage('success', 'Campaign Created Successfully') );
      }

      dispatch(formSaved());
      history.pushState(null, '/campaigns/' + response.result.id);
    }
  }
}

CampaignForm.propTypes = {
  editMode: PropTypes.bool.isRequired
};
