import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { formatDate } from 'helpers/DateHelpers';
import { getChannel, getCountry } from 'actions/Init/InitActions';

export default class CampaignRow extends Component {
  render() {
    const channel = getChannel(this.props.channel_id, this.props.init_channels);

    return (
      <tr>
        <td>{this.props.id}</td>
        <td><Link to={'/campaigns/' + this.props.id}>{this.props.name}</Link></td>
        <td>{(channel) ? _.capitalize(channel.name) : ''}</td>
        <td>{this.outputCountries(this.props.countries)}</td>
        <td className={'status ' + ((this.props.paused) ? 'paused' : 'active')}>{(this.props.paused) ? 'Paused' : 'Active'}</td>
        <td>{formatDate(this.props.start_date, 'M/D/YYYY')}</td>
        <td>{formatDate(this.props.end_date, 'M/D/YYYY')}</td>
      </tr>
    );
  }

  outputCountries(countries){
    let output = '';
    let country;

    countries.map((row, index) => {
      if (index > 0) {
        output += ', ';
      }

      country = getCountry(row, this.props.init_countries);
      if (country !== undefined && country.country_name !== undefined) {
        output += country.country_name;
      }
    });

    return output;
  }
}

CampaignRow.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  channel_id: PropTypes.number.isRequired,
  countries: PropTypes.array.isRequired,
  paused: PropTypes.bool.isRequired,
  start_date: PropTypes.string.isRequired,
  end_date: PropTypes.string.isRequired,
  init_channels: PropTypes.array.isRequired,
  init_countries: PropTypes.array.isRequired
};
