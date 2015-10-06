import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { formatDate } from 'helpers/DateHelpers';

export default class CampaignDetails extends Component {
  render() {
    const data = this.props.Campaign.details;

    let countries = '';
    if(data.countries !== undefined && data.countries.length > 0){
      data.countries.map(function(val, index){
        if(index !== 0){
          countries += ', ';
        }
        countries += val;
      });
    }

    let details;
    if (this.props.Campaign.isFetching === false) {
      details = (
        <div className="panel panel-default">
          <div className="panel-heading">
            <div className="pull-right">
              {(data.paused) ? 'PAUSED' : 'ACTIVE'}
            </div>
            <div className="pull-left">
              <div>{data.name} <Link to={'/campaigns/' + data.id + '/edit'}> <i className="fa fa-pencil"></i></Link></div>
              <p>ID: {data.id}</p>
            </div>

            <div className="clearfix"></div>
          </div>
          <div className="panel-body">
            <p><strong>Channel ID:</strong> {data.channel_id}</p>

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
