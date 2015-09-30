import React, { Component } from 'react/addons';
import { connect } from 'react-redux';

import { fetchHierarchy } from 'actions/App/BreadCrumbActions';
import { updateDocTitle, pageVisit } from 'actions/App/AppActions';
import { createCampaign } from 'actions/Campaigns/CampaignActions';

import $ from 'jquery';
window.$ = $;
require('jquery-serializejson');
require('select2');
require('select2/dist/css/select2.min.css');

export default class CampaignCreatePage extends Component {
  componentDidMount() {
    this.fetchAccountDetails(this.props);

    const context = this;
    $('#CampaignForm input').keydown(function(e){
      if (e.which === 13) {
        context.handleFormSubmit(e);
      }
    });

    $('#CampaignCountries').select2();
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
              <input type="hidden" name="id" ref="id" value={this.props.params.accountId} />
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
    const data = JSON.stringify($('#CampaignForm').serializeJSON());
    /*
    console.log($('#CampaignForm').serializeJSON());
    console.log(data);
    */
    /*dispatch(createCampaign(data)).then(function(){
      props.history.pushState(null, '/');
    });*/
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
