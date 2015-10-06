import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { displayMessage, shownMessage } from 'actions/App/AppActions';
import { createCampaign, updateCampaign} from 'actions/Campaigns/CampaignActions';
import { bindFormValidators, bindFormConfig } from 'helpers/FormValidators';
import Moment from 'moment';

window.$ = require('jquery');
window.jQuery = $;
require('select2');
require('select2/dist/css/select2.min.css');

bindFormConfig();
require('parsleyjs');

require('../../../styles/app/forms.scss');

export default class CampaignForm extends Component {
  componentDidMount() {
    $('#CampaignCountries').select2();

    bindFormValidators();
  }

  render() {
    let spinner;
    if(this.props.isSaving){
      spinner = <img src="/public/img/ajax-loader.gif" />;
    }

    return (
      <div>
        <form id="CampaignForm" ref="form">
          <input type="hidden" name="account_id" ref="account_id" value={this.props.data.account_id} />
          <div className="form-group">
            <label htmlFor="CampaignName">Name</label>
            <input className="form-control" type="text" id="CampaignName" name="name" ref="name" defaultValue={this.props.data.name} data-parsley-required />
          </div>
          <div className="form-group">
            <label htmlFor="CampaignStartDate">Start Date</label>
            <input className="form-control" type="text" id="CampaignStartDate" name="start_date" ref="start_date" defaultValue={this.props.data.start_date} data-parsley-dateformat data-parsley-required />
          </div>
          <div className="form-group">
            <label htmlFor="CampaignEndDate">End Date</label>
            <input className="form-control" type="text" id="CampaignEndDate" name="end_date" ref="end_date" defaultValue={this.props.data.end_date} data-parsley-dateformat data-parsley-required />
          </div>
          <div className="form-group">
            <label htmlFor="CampaignCountries">Countries</label><br/>
            <select className="form-control" style={{width: '100%', display: 'none'}} type="text" id="CampaignCountries" name="countries[]" ref="countries" multiple="multiple" defaultValue={this.props.data.countries} data-parsley-required>
              <option value="US" >US</option>
              <option value="STAR" >STAR</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="CampaignChannelId">Channel</label>
            <select className="form-control" id="CampaignChannelId" name="channel_id" ref="channel_id" defaultValue={this.props.data.channel_id} data-parsley-required >
              <option value="1">1</option>
            </select>
          </div>
          <input onClick={(e) => this.handleFormSubmit(e)} type="submit" value="Submit" className="btn btn-primary"/>
          &nbsp;
          {(this.props.editMode)
            ? <Link to={'/campaigns/' + this.props.data.id} className="btn btn-default">Cancel</Link>
            : <Link to={'/accounts/' + this.props.data.account_id} className="btn btn-default">Cancel</Link>
          }
          &nbsp;
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
        //formData.start_date = Moment(formData.start_date).unix();
      }
      if(formData.end_date.trim() !== ''){
        //formData.end_date = Moment(formData.end_date).unix();
      }
      delete formData.start_date;
      delete formData.end_date;
      formData.paused = false;

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

    dispatch(updateCampaign(this.props.data.id, data))
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
        dispatch(shownMessage());
      }
      else{
        dispatch(displayMessage('success', 'Campaign Created Successfully') );
        history.pushState(null, '/campaigns/' + response.result.id);
      }
    }
  }
}

CampaignForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  editMode: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  isSaving: PropTypes.bool.isRequired
};
