import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { displayMessage, shownMessage } from 'actions/App/AppActions';
import { createAdGroup, updateAdGroup, fetchAdGroups } from 'actions/AdGroups/AdGroupActions';
import { bindFormValidators, bindFormConfig } from 'helpers/FormValidators';

window.$ = require('jquery');
window.jQuery = $;
require('select2');
require('select2/dist/css/select2.min.css');
require('jquery-serializejson');

bindFormConfig();
require('parsleyjs');

export default class AdGroupForm extends Component {
  componentDidMount(){
    bindFormValidators();

    $('.js-select').select2();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.AdGroup.details.id !== this.props.AdGroup.details.id ||
        prevProps.Campaign.details.id !== this.props.Campaign.details.id){
      bindFormValidators();

      $('.js-select').select2();
    }
  }

  render() {
    let spinner;
    if(this.props.AdGroup.isSaving){
      spinner = <img src="/public/img/ajax-loader.gif" />;
    }

    let data = this.props.AdGroup.details;
    if(this.props.editMode === false){
      data = {};
    }
    if(data.campaign_id === undefined){
      data.campaign_id = this.props.params.campaignId;
    }

    const categories = this.props.Init.categories.map((row, index) =>
        <option key={'categories-' + index} value={row}>{row}</option>
    );
    const channels = this.props.Init.channels.map((row, index) =>
        <option key={'channel-' + index} value={row.id}>{_.capitalize(row.name)}</option>
    );
    const locales = this.props.Init.locales.map((row, index) =>
        <option key={'locales-' + index} value={row}>{row}</option>
    );

    return (
      <div>
        <form id="AdGroupForm" ref="form" key={'adgroupform-' + ((this.props.editMode) ? 'edit-' + data.id : 'create-' + data.campaign_id )}>
          {(this.props.editMode) ? (<input type="hidden" id="AdGroupId" name="id" ref="id" value={data.id}/>) : null}
          <input type="hidden" name="campaign_id" ref="campaign_id" value={data.campaign_id} />
          <div className="form-group">
            <label htmlFor="AdGroupName">Name</label>
            <input className="form-control" type="text" id="AdGroupName" name="name" ref="name" defaultValue={data.name} data-parsley-required data-parsley-minlength="2"/>
          </div>
          {(this.props.editMode)
            ? (<div className="form-group">
            <label htmlFor="AdGroupPaused">Paused</label>
            <div className="onoffswitch">
              <input type="checkbox" name="paused" ref="paused" className="onoffswitch-checkbox" id="AdGroupPaused" defaultChecked={data.paused} value="true"/>
              <label className="onoffswitch-label" htmlFor="AdGroupPaused"></label>
            </div>
          </div>)
            : <input type="hidden" name="paused" ref="paused" value={false}/>
          }
          <div className="form-group">
            <label htmlFor="AdGroupExplanation">Explanation</label>
            <input className="form-control" type="text" id="AdGroupExplanation" name="explanation" ref="explanation" defaultValue={data.explanation} />
          </div>
          <div className="form-group">
            <label htmlFor="AdGroupFrequencyCapDaily">Frequency Cap Daily</label>
            <input className="form-control" type="text" id="AdGroupFrequencyCapDaily" name="frequency_cap_daily" ref="frequency_cap_daily" defaultValue={data.frequency_cap_daily} />
          </div>
          <div className="form-group">
            <label htmlFor="AdGroupFrequencyCapTotal">Frequency Cap Total</label>
            <input className="form-control" type="text" id="AdGroupFrequencyCapTotal" name="frequency_cap_total" ref="frequency_cap_total" defaultValue={data.frequency_cap_total} />
          </div>
          <div className="form-group">
            <label htmlFor="AdGroupType">Type</label>
            <select className="form-control" id="AdGroupType" name="type" ref="type" defaultValue={data.type} >
              <option value="directory">Directory</option>
              <option value="suggested">Suggested</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="AdGroupCategories">Categories</label><br/>
            <select className="form-control js-select" style={{width: '100%'}} id="AdGroupCategories" name="categories[]" multiple="multiple" ref="categories" defaultValue={data.categories} data-parsley-required>
              {categories}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="AdGroupChannelId">Channel</label>
            <select className="form-control" id="AdGroupChannelId" name="channel_id" ref="channel_id" defaultValue={data.channel_id} data-parsley-required >
              {channels}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="AdGroupLocales">Locale</label><br/>
            <select className="form-control js-select" style={{width: '100%'}} id="AdGroupLocales" name="locale" ref="locale" defaultValue={data.locale} data-parsley-required>
              <option></option>
              {locales}
            </select>
          </div>

          <input onClick={(e) => this.handleFormSubmit(e)} type="submit" value="Save" className="btn btn-primary"/>
          {(this.props.editMode)
            ? <Link to={'/adgroups/' + data.id} className="btn btn-default">Cancel</Link>
            : <Link to={'/campaigns/' + data.campaign_id} className="btn btn-default">Cancel</Link>
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

    const form = $('#AdGroupForm').parsley();

    if(form.validate()){
      const data = JSON.stringify($('#AdGroupForm').serializeJSON());

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

    dispatch(createAdGroup(data))
      .then(function(response){
        context.handleResponse(response);
      });
  }

  handleUpdate(data){
    const { dispatch } = this.props;
    const context = this;

    dispatch(updateAdGroup(this.props.AdGroup.details.id, data))
      .then(function(response){
        context.handleResponse(response);
      }
    );
  }

  handleResponse(response){
    const { dispatch, history } = this.props;

    if(response.result === undefined){
      dispatch(displayMessage('error', response.message) );
      dispatch(shownMessage());
    }
    else{
      if(this.props.editMode){
        dispatch(displayMessage('success', 'Ad Group Updated Successfully') );
      }
      else{
        dispatch(displayMessage('success', 'Ad Group Created Successfully') );
      }
      history.pushState(null, '/adgroups/' + response.result.id);
    }
  }
}

AdGroupForm.propTypes = {
  editMode: PropTypes.bool.isRequired
};
