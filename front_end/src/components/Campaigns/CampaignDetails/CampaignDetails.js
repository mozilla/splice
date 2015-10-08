import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { formatDate } from 'helpers/DateHelpers';
import { getChannel, getCountry } from 'actions/Init/InitActions';

export default class CampaignDetails extends Component {
  getCountries(){
    const data = this.props.Campaign.details;
    const context = this;

    let countries = '';
    if(data.countries !== undefined && data.countries.length > 0 &&  this.props.Init.countries.length > 0){
      data.countries.map(function(val, index){
        if(index !== 0){
          countries += ', ';
        }
        const country = getCountry(val, context.props.Init.countries);
        if(country) {
          countries += country.country_name;
        }
      });
    }
    return countries;
  }

  render() {
    const data = this.props.Campaign.details;

    const countries = this.getCountries();

    const channel = getChannel(data.channel_id, this.props.Init.channels);

    let details;
    if (this.props.Campaign.isFetching === false) {
      details = (
        <div className="panel panel-default details-panel">
          <div className="panel-heading">
            <div className="pull-right">
              <div className="">{(data.paused) ? 'PAUSED' : 'ACTIVE'}</div>
            </div>
            <div className="pull-left">
              <h2>{data.name}</h2>
              <Link to={'/campaigns/' + data.id + '/edit'} title="Edit">
                <span className="fa-stack fa-md">
                <i className="fa fa-square fa-stack-2x"></i>
                <i className="fa fa-pencil fa-stack-1x fa-inverse"></i>
              </span>
              </Link>
              <p className="text-muted">ID: {data.id}</p>
            </div>

            <div className="clearfix"></div>
          </div>
          <div className="panel-body">
            <p><strong>Channel:</strong> {(channel) ? _.capitalize(channel.name) : ''}</p>

            <p><strong>Countries:</strong> {countries}</p>

            <p><strong>Start Date:</strong> {(data.start_date !== null) ? formatDate(data.start_date, 'M/D/YYYY') : ''}</p>

            <p><strong>End Date:</strong> {(data.end_date !== null) ? formatDate(data.end_date, 'M/D/YYYY') : ''}</p>

            <p><strong>Created:</strong> {formatDate(data.created_at, 'M/D/YYYY')}</p>
          </div>
        </div>
      );
    } else {
      details = <img src="./public/img/ajax-loader.gif"/>;
    }

    return (<div>{details}</div>);
  }
}

CampaignDetails.propTypes = {
  Campaign: PropTypes.object.isRequired
};
