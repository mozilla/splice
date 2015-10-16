import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { displayMessage, shownMessage } from 'actions/App/AppActions';
import { createCampaign, updateCampaign} from 'actions/Campaigns/CampaignActions';
import { bindFormValidators, bindFormConfig } from 'helpers/FormValidators';
import { formatDate, apiDate } from 'helpers/DateHelpers';
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
  componentDidMount() {
    bindFormValidators();

    $('.js-select').select2();

    const options = {
      useCurrent: true,
      format: 'YYYY-MM-DD',
      showTodayButton: true
    };
    $('#CampaignStartDate').datetimepicker(options);
    $('#CampaignEndDate').datetimepicker(options);
  }

  render() {
    let spinner;
    if(this.props.Campaign.isSaving){
      spinner = <img src="/public/img/ajax-loader.gif" />;
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
        <form id="CampaignForm" ref="form">
          {(this.props.editMode) ? (<input type="hidden" name="id" ref="id" value={data.id}/>) : null}
          <input type="hidden" name="account_id" ref="account_id" value={data.account_id} />

          <div className="form-group">
            <label htmlFor="CampaignName">Name</label>
            <input className="form-control" type="text" id="CampaignName" name="name" ref="name" defaultValue={data.name} data-parsley-required data-parsley-minlength="2"/>
          </div>
          {(this.props.editMode)
            ? (<div className="form-group">
                <label htmlFor="AccountPaused">Paused</label>
                <div className="onoffswitch">
                  <input type="checkbox" name="paused" ref="paused" className="onoffswitch-checkbox" id="AccountPaused" defaultChecked={data.paused} value="true"/>
                  <label className="onoffswitch-label" htmlFor="AccountPaused"></label>
                </div>
              </div>)
            : <input type="hidden" name="paused" ref="paused" value={false}/>
          }
          <div className="form-group">
            <label htmlFor="CampaignStartDate">Start Date</label>
            <input className="form-control" type="text" id="CampaignStartDate" name="start_date" ref="start_date" defaultValue={formatDate(data.start_date, 'YYYY-MM-DD')} data-parsley-dateformat data-parsley-required />
          </div>
          <div className="form-group">
            <label htmlFor="CampaignEndDate">End Date</label>
            <input className="form-control" type="text" id="CampaignEndDate" name="end_date" ref="end_date" defaultValue={formatDate(data.end_date, 'YYYY-MM-DD')} data-parsley-dateformat data-parsley-required />
          </div>
          <div className="form-group">
            <label htmlFor="CampaignCountries">Countries</label><br/>
            <select className="form-control js-select" style={{width: '100%'}} id="CampaignCountries" name="countries[]" ref="countries" multiple="multiple" defaultValue={data.countries} data-parsley-required>
              {countries}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="CampaignChannelId">Channel</label>
            <select className="form-control" id="CampaignChannelId" name="channel_id" ref="channel_id" defaultValue={data.channel_id} data-parsley-required >
              {channels}
            </select>
          </div>
          <input onClick={(e) => this.handleFormSubmit(e)} type="submit" value="Submit" className="btn btn-primary"/>
          {(this.props.editMode)
            ? <Link to={'/campaigns/' + data.id} className="btn btn-default">Cancel</Link>
            : <Link to={'/accounts/' + data.account_id} className="btn btn-default">Cancel</Link>
          }
          {spinner}
        </form>
      </div>
    );
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
    }
    else{
      if(this.props.editMode){
        dispatch(displayMessage('success', 'Campaign Updated Successfully') );
      }
      else{
        dispatch(displayMessage('success', 'Campaign Created Successfully') );
      }
      history.pushState(null, '/campaigns/' + response.result.id);
    }
  }
}

CampaignForm.propTypes = {
  editMode: PropTypes.bool.isRequired
};
