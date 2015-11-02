import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { formatDate } from 'helpers/DateHelpers';

export default class AdGroupRow extends Component {
  render() {
    //console.log(this.props.id);
    return (
      <tr>
        <td>{this.props.id}</td>
        <td><Link to={'/adgroups/' + this.props.id}>{this.props.name}</Link></td>
        <td>{this.props.locale}</td>
        <td>{_.capitalize(this.props.type)}</td>
        <td>{(this.props.paused) ? 'Paused' : 'Active'}</td>
        <td>{formatDate(this.props.created_at, 'M/D/YYYY')}</td>
      </tr>
    );
  }
}

AdGroupRow.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired
};
