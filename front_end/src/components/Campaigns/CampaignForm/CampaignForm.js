import React, { Component, PropTypes } from 'react';

import { displayMessage, shownMessage, formChanged, formSaved } from 'actions/App/AppActions';
import { createCampaign, updateCampaign} from 'actions/Campaigns/CampaignActions';
import { bindFormValidators, bindFormConfig } from 'helpers/FormValidators';
import { formatDate, apiDate } from 'helpers/DateHelpers';
import CustomRadio from 'components/Forms/CustomRadio/CustomRadio';
import Moment from 'moment';

window.$ = require('jquery');
window.jQuery = $;
require('select2');
require('select2/dist/css/select2.min.css');
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
    this.frontEndScripts();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.Campaign.details.id !== this.props.Campaign.details.id ||
        prevProps.Account.details.id !== this.props.Account.details.id ){
      this.frontEndScripts();
    }
  }

  render() {
    let spinner;
    if(this.props.Campaign.isSaving){
      spinner = <img src="/public/img/ajax-loader-aqua.gif" />;
    }

    let data = this.props.Campaign.details;
    if(this.props.editMode === false){
      data = {};
    }
    if(data.account_id === undefined){
      data.account_id = this.props.params.accountId;
    }

    const channels = this.props.Init.channels.map((row, index) =>
        <option key={'channel-' + index} value={row.id}>{_.capitalize(row.name)}</option>
    );

    const countries = this.props.Init.countries.map((row, index) =>
        <option key={'country-' + index} value={row.country_code}>{row.country_name}</option>
    );

    return (
      <div>
        <form id="CampaignForm" ref="form" key={'campaignform-' + ((this.props.editMode) ? 'edit-' + data.id : 'create-' + data.account_id )}>
          {(this.props.editMode) ? (<input type="hidden" name="id" ref="id" value={data.id}/>) : null}
          <input type="hidden" name="account_id" ref="account_id" value={data.account_id} />

          <div className="container-fluid field-container">
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
                  <select className="form-control js-select" onChange={this.handleChange} style={{width: '100%'}} id="CampaignCountries" name="countries[]" ref="countries" multiple="multiple" defaultValue={data.countries} data-parsley-required>
                    {countries}
                  </select>
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
    bindFormValidators();

    $('.js-select').select2().on('change', function(){
      context.handleChange();
    });

    const options = {
      useCurrent: true,
      format: 'YYYY-MM-DD',
      showTodayButton: true
    };
    $('#CampaignStartDate, #CampaignEndDate').datetimepicker(options).blur(function(){
      context.handleChange();
    });
  }

  handleChange(){
    if(this.props.App.formChanged !== true){
      this.props.dispatch(formChanged());
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();

    //Exclude validation of Select2 inputs.
    $('input.select2-search__field').attr('data-parsley-excluded', true);

    const form = $('#CampaignForm').parsley();

    if(form.validate()){
      const formData = $('#CampaignForm').serializeJSON();
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
