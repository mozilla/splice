import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

window.$ = require('jquery');
require('select2');
require('select2/dist/css/select2.min.css');

export default class CampaignForm extends Component {
  componentDidMount() {
    $('#CampaignCountries').select2();
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
            <input className="form-control" type="text" id="CampaignName" name="name" ref="name" defaultValue={this.props.data.name} />
          </div>
          <div className="form-group">
            <label htmlFor="CampaignStartDate">Start Date</label>
            <input className="form-control" type="text" id="CampaignStartDate" name="start_date" ref="start_date" defaultValue={this.props.data.start_date}/>
          </div>
          <div className="form-group">
            <label htmlFor="CampaignEndDate">End Date</label>
            <input className="form-control" type="text" id="CampaignEndDate" name="end_date" ref="end_date" defaultValue={this.props.data.end_date} />
          </div>
          <div className="form-group">
            <label htmlFor="CampaignCountries">Countries</label><br/>
            <select className="form-control" style={{width: '100%', display: 'none'}} type="text" id="CampaignCountries" name="countries[]" ref="countries" multiple="multiple" defaultValue={this.props.data.countries} >
              <option value="US" >US</option>
              <option value="STAR" >STAR</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="CampaignChannelId">Channel</label>
            <select className="form-control" id="CampaignChannelId" name="channel_id" ref="channel_id" defaultValue={this.props.data.channel_id} >
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

    this.props.handleFormSubmit('#CampaignForm');
  }
}

CampaignForm.propTypes = {
  editMode: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  handleFormSubmit: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired
};
