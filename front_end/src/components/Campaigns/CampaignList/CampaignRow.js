import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { formatDate } from 'helpers/DateHelpers';

export default class CampaignRow extends Component {
  render() {
    //console.log(this.props.id);
    return (
      <tr>
        <td>{this.props.id}</td>
        <td><Link to={'/campaigns/' + this.props.id}>{this.props.name}</Link></td>
        <td>{this.props.channel_id}</td>
        <td>{(this.props.paused) ? 'Paused' : 'Active'}</td>
        <td>{formatDate(this.props.created_at, 'M/D/YYYY')}</td>
      </tr>
    );
  }
}

CampaignRow.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  channel_id: PropTypes.number.isRequired,
  paused: PropTypes.bool.isRequired,
  created_at: PropTypes.string.isRequired
};
