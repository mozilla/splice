import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { formatDate } from 'helpers/DateHelpers';
import { getChannel } from 'actions/Init/InitActions';
import CampaignCountries from 'components/Campaigns/CampaignCountries/CampaignCountries';

export default class CampaignDetails extends Component {
  render() {
    const data = this.props.Campaign.details;

    const channel = getChannel(data.channel_id, this.props.Init.channels);

    let details;
    if (this.props.Campaign.isFetching === false) {
      details = (
        <div className="details-panel campaign-details">
          <div className="details-panel-header">
            <div className={'details-panel-status ' + ((data.paused) ? 'paused' : 'active')}>{(data.paused) ? 'PAUSED' : 'ACTIVE'}</div>

            <div className="table-cell">
              <h2 className="details-panel-name">{data.name}</h2>
              <div className="details-panel-id">ID: {data.id}</div>
            </div>

            <div className="details-edit-link">
              <Link className="" to={'/campaigns/' + data.id + '/edit'} title="Edit">
                <i className="fa fa-pencil"></i>
              </Link>
            </div>
          </div>
          <div className="details-panel-body">
            <div className="row">
              <div className="col-xs-4">
                <div className="data-value">
                  <strong>Channel</strong>
                  {(channel) ? _.capitalize(channel.name) : ''}
                </div>
              </div>
              <div className="col-xs-4">
                <div className="data-value">
                  <strong>Countries</strong>
                  <CampaignCountries countries={data.countries} initCountries={this.props.Init.countries}/>
                </div>
              </div>
              <div className="col-xs-4">
                <div className="data-value">
                  <strong>Schedule</strong>
                  <div>Start</div>
                  <div className="small">{(data.start_date !== null) ? formatDate(data.start_date, 'M/D/YYYY') : ''}</div>
                  <div>|</div>
                  <div>End</div>
                  <div className="small">{(data.end_date !== null) ? formatDate(data.end_date, 'M/D/YYYY') : ''}</div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-xs-4">
                <div className="data-value">
                  <strong>Created</strong>
                  {formatDate(data.created_at, 'M/D/YYYY')}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      details = <img src={require('../../../public/img/ajax-loader-navy.gif')}/>;
    }

    return details;
  }
}

CampaignDetails.propTypes = {
  Campaign: PropTypes.object.isRequired
};
