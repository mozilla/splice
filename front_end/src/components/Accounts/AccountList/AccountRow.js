import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { formatDate } from 'helpers/DateHelpers';
import numeral from 'numeral';

export default class AccountRow extends Component {
  render() {
    //console.log(this.props.id);
    return (
      <tr>
        <td>{this.props.id}</td>
        <td><Link to={'/accounts/' + this.props.id}>{this.props.name}</Link></td>
        <td>{this.props.contact_email}</td>
        <td>{this.props.contact_phone}</td>
        <td>{formatDate(this.props.created_at, 'YYYY-MM-DD')}</td>
        <td className="number">{numeral(this.props.blocked).format('0,0')}</td>
        <td className="number">{numeral(this.props.clicked).format('0,0')}</td>
        <td className="number">{numeral(this.props.impressions).format('0,0')}</td>
        <td className="number">{numeral(this.props.pinned).format('0,0')}</td>
      </tr>
    );
  }
}

AccountRow.propTypes = {
  name: PropTypes.string.isRequired,
  contact_email: PropTypes.string.isRequired,
  contact_phone: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired
};
