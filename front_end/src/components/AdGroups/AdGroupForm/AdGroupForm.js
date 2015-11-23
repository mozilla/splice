import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { displayMessage, shownMessage, formChanged, formSaved } from 'actions/App/AppActions';
import { createAdGroup, updateAdGroup, fetchAdGroups, adGroupSetDetailsVar } from 'actions/AdGroups/AdGroupActions';
import { bindFormValidators, bindFormConfig } from 'helpers/FormValidators';
import { fetchCampaigns, receiveCampaigns, fetchCampaign } from 'actions/Campaigns/CampaignActions';
import ReactSelect from 'react-select';

window.$ = require('jquery');
window.jQuery = $;
require('react-select/dist/react-select.min.css');
require('jquery-serializejson');

bindFormConfig();
require('parsleyjs');

export default class AdGroupForm extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleSwitch = this.handleSwitch.bind(this);
  }

  componentWillMount(){
    if(this.props.AdGroup.details.type === undefined){
      this.props.dispatch(adGroupSetDetailsVar('type', 'suggested'));
    }
  }
  componentDidMount(){
    bindFormValidators();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.AdGroup.details.id !== this.props.AdGroup.details.id ||
        prevProps.Campaign.details.id !== this.props.Campaign.details.id){
      bindFormValidators();
    }

    $('.Select input[type="hidden"]').trigger('keyup');
  }

  render() {
    let spinner;
    if(this.props.AdGroup.isSaving){
      spinner = <img src="/public/img/ajax-loader-aqua.gif" />;
    }

    const data = this.props.AdGroup.details;

    const accounts = [];
    const campaigns = [];
    const locales = [];
    const categories = [];

    if(data.campaign_id === undefined && this.props.params.campaignId !== undefined){
      data.campaign_id = this.props.params.campaignId;
    }
    else if(this.props.Account.rows !== undefined) {
      this.props.Account.rows.map((row, index) =>
        accounts.push({value: row.id, label: row.name})
      );
    }

    if (this.props.Campaign.rows !== undefined) {
      this.props.Campaign.rows.map((row, index) =>
        campaigns.push({value: row.id, label: row.name})
      );
    }

    if (this.props.Init.locales !== undefined) {
      this.props.Init.locales.map((row, index) =>
        locales.push({value: row, label: row})
      );
    }

    if (this.props.Init.categories !== undefined) {
      this.props.Init.categories.map((row, index) =>
        categories.push({value: row, label: row})
      );
    }

    return (
      <div>
        <form id="AdGroupForm" ref="form" key={'adgroupform-' + ((this.props.editMode) ? 'edit-' + data.id : 'create' )}>
          {(this.props.editMode) ? (<input type="hidden" id="AdGroupId" name="id" ref="id" value={data.id}/>) : null}

          <div className="container-fluid field-container">
            {(this.props.editMode === false && this.props.params.campaignId === undefined) ?
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
                  <div className="col-xs-4">
                    <div className="form-group">
                      <label htmlFor="CampaignId">Campaign</label>
                      <ReactSelect
                        className="campaign-select"
                        name="campaign_id"
                        value={data.selected_campaign_id}
                        options={campaigns}
                        onChange={(id, option) => this.handleSelectCampaign(id, option)}
                        placeholder=""
                        clearable={false}
                        inputProps={{
                          'id': 'CampaignId',
                          'data-parsley-excluded': true
                        }}
                      />
                    </div>
                  </div>
                </div>
                <hr/>
              </div>
              : <input type="hidden" name="campaign_id" ref="campaign_id" value={data.campaign_id} />
            }

            <div className="row">
              <div className="col-xs-4">
                {(this.props.editMode)
                  ? (<div className="form-group">
                  <label htmlFor="AdGroupPaused">Paused</label>
                  <div className="onoffswitch">
                    <input type="checkbox" onChange={this.handleChange} name="paused" ref="paused" className="onoffswitch-checkbox" id="AdGroupPaused" defaultChecked={data.paused} value="true"/>
                    <label className="onoffswitch-label" htmlFor="AdGroupPaused"></label>
                  </div>
                </div>)
                  : <input type="hidden" name="paused" ref="paused" value={false}/>
                }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-4">
                <div className="form-group">
                  <label htmlFor="AdGroupName">Ad Group Name</label>
                  <input className="form-control" type="text" onChange={this.handleChange} id="AdGroupName" name="name" ref="name" defaultValue={data.name} data-parsley-required data-parsley-minlength="2"/>
                </div>
                {(this.props.AdGroup.details.type === 'suggested')
                  ? <div className="form-group">
                      <textarea className="form-control" onChange={this.handleChange} placeholder="Description" type="text" id="AdGroupExplanation" name="explanation" ref="explanation" defaultValue={data.explanation} />
                    </div>
                  : null
                }
              </div>
              <div className="col-xs-4 col-xs-push-3">
                <div className="form-group">
                  <label htmlFor="AdGroupType">Product Type</label>
                  <div className="switch-group">
                    <div className="switch-option switch-option-one">
                      Suggested
                    </div>
                    <div className="onoffswitch transparent">
                      <input type="checkbox" name="type" ref="type" onChange={this.handleSwitch} className="onoffswitch-checkbox" id="AdGroupType" defaultChecked={(data.type === 'suggested' || data.type === undefined) ? false : true} value="true"/>
                      <label className="onoffswitch-label" htmlFor="AdGroupType"></label>
                    </div>
                    <div className="switch-option switch-option-two">
                      Directory
                    </div>
                    <div className="clearfix" ></div>
                    {/*<div className="switch-copy" >
                     Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec cursus nulla et hendrerit mollis. Vivamus ullamcorper, lectus eget vestibulum placerat, leo erat ultrices tortor, eget tincidunt elit nulla sit amet metus.
                     </div>*/}
                  </div>
                </div>
              </div>
            </div>
            {(this.props.AdGroup.details.type === 'suggested' || this.props.editMode === false) ?
              (<div>
                  <hr/>
                  <div className="row">
                    <div className="col-xs-12">
                      <h3 className="form-section-header">Audience</h3>
                    </div>
                  </div>
               </div>)
              : null
            }

            <div className="row">
              <div className="col-xs-4">
              {(this.props.editMode === false) ?
                (<div>
                    <input type="hidden" name="channel_id" ref="channel_id" value={this.props.Campaign.details.channel_id} />
                    <div className="form-group">
                      <label htmlFor="AdGroupLocales">Locale</label><br/>
                      <ReactSelect
                        className="locales-select"
                        name="locale"
                        value={data.locale}
                        options={locales}
                        onChange={(id, option) => this.handleSelect(id, option, 'locale')}
                        placeholder=""
                        clearable={false}
                        inputProps={{
                          'id': 'AdGroupLocales',
                          'data-parsley-excluded': true
                        }}
                      />
                    </div>
                </div>)
                : null
              }

                <div className={(this.props.AdGroup.details.type === 'directory')  ? 'hide' : '' }>
                  <div className="form-group">
                    <label htmlFor="AdGroupCategories">Categories</label><br/>
                    <ReactSelect
                      className="categories-select"
                      name="categories[]"
                      disabled={(data.type === 'directory')}
                      multi={true}
                      value={data.categories}
                      options={categories}
                      onChange={(id, options) => this.handleMultiSelect(id, options, 'categories')}
                      placeholder=""
                      clearable={false}
                      inputProps={{
                          'id': 'AdGroupCategories',
                          'data-parsley-excluded': true
                        }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {(this.props.editMode === false) ?
              (<div className={(this.props.AdGroup.details.type === 'directory')  ? 'hide' : '' }>
                <hr/>
                <div className="row">
                  <div className="col-xs-12">
                    <h3 className="form-section-header">Budget</h3>
                  </div>
                </div>
                <div className="row">
                  <div className="col-xs-2">
                    <div className="form-group">
                      <label htmlFor="AdGroupFrequencyCapDaily">Frequency <span style={{whiteSpace: 'nowrap'}}>Cap Daily</span></label>
                      <input disabled={(this.props.AdGroup.details.type === 'directory')} onChange={this.handleChange} className="form-control" type="text" id="AdGroupFrequencyCapDaily" name="frequency_cap_daily" ref="frequency_cap_daily" defaultValue={data.frequency_cap_daily} data-parsley-type="number" data-parsley-required/>
                    </div>
                  </div>
                  <div className="col-xs-2">
                    <div className="form-group">
                      <label htmlFor="AdGroupFrequencyCapTotal">Frequency <span style={{whiteSpace: 'nowrap'}}>Cap Total</span></label>
                      <input disabled={(this.props.AdGroup.details.type === 'directory')} onChange={this.handleChange} className="form-control" type="text" id="AdGroupFrequencyCapTotal" name="frequency_cap_total" ref="frequency_cap_total" defaultValue={data.frequency_cap_total} data-parsley-type="number" data-parsley-required/>
                    </div>
                  </div>
                </div>
              </div>)
              : null
            }
          </div>

          <button onClick={this.handleFormSubmit} className="form-submit">Save {spinner}</button>
        </form>
      </div>
    );
  }

  handleSelectAccount(id, option){
    this.props.dispatch(adGroupSetDetailsVar('selected_account_id', id));

    if(id !== ''){
      this.props.dispatch(fetchCampaigns(id, true, true, true));
    }
    else{
      this.props.dispatch(receiveCampaigns({ results: [] }));
    }

    this.handleSelectCampaign('');
    this.handleChange();
  }

  handleSelectCampaign(id, option) {
    this.props.dispatch(adGroupSetDetailsVar('selected_campaign_id', id));
    if(id !== ''){
      this.props.dispatch(fetchCampaign(id));
    }

    this.handleChange();
  }

  handleSelect(id, option, varName){
    this.props.dispatch(adGroupSetDetailsVar(varName, id));
    this.handleChange();
  }

  handleMultiSelect(id, options, varName){
    this.props.dispatch(adGroupSetDetailsVar(varName, options));
    this.handleChange();
  }

  handleChange(){
    if(this.props.App.formChanged !== true){
      this.props.dispatch(formChanged());
    }
  }

  handleSwitch(e){
    this.handleChange();

    let value = 'suggested';

    if($('#' + e.target.id).prop('checked') === true){
      value = 'directory';
    }
    this.props.dispatch(adGroupSetDetailsVar('type', value));
  }

  handleFormSubmit(e) {
    e.preventDefault();

    $('input[name="account_id"], input[name="campaign_id"], input[name="locale"]')
      .attr('data-parsley-required', 'true');
    $('input[name="categories[]"]')
      .attr('data-parsley-required', 'true')
      .attr('data-parsley-mincheck', '1');

    const form = $('#AdGroupForm').parsley();

    if(form.validate()){
      const formData = $('#AdGroupForm').serializeJSON();

      formData.categories = $('input[name="categories[]"]').val().split(',');

      if(formData.type === undefined){
        formData.type = 'suggested';
      }
      else{
        formData.type = 'directory';
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
      window.scrollTo(0, 0);
    }
    else{
      if(this.props.editMode){
        dispatch(displayMessage('success', 'Ad Group Updated Successfully') );
      }
      else{
        dispatch(displayMessage('success', 'Ad Group Created Successfully') );
      }
      dispatch(formSaved());
      history.pushState(null, '/adgroups/' + response.result.id);
    }
  }
}

AdGroupForm.propTypes = {
  AdGroup: PropTypes.object.isRequired,
  editMode: PropTypes.bool.isRequired
};
