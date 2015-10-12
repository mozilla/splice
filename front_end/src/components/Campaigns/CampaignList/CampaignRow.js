import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { formatDate } from 'helpers/DateHelpers';
import { getChannel } from 'actions/Init/InitActions';

export default class CampaignRow extends Component {
  render() {
    const channel = getChannel(this.props.channel_id, this.props.channels);

    return (
      <tr>
        <td>{this.props.id}</td>
        <td><Link to={'/campaigns/' + this.props.id}>{this.props.name}</Link></td>
        <td>{(channel) ? _.capitalize(channel.name) : ''}</td>
        <td className={'status ' + ((this.props.paused) ? 'paused' : 'active')}>{(this.props.paused) ? 'Paused' : 'Active'}</td>
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
