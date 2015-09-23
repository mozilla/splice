import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { formatPsDateTime } from 'helpers/ViewHelpers';

export default class AdGroupRow extends Component {
  render() {
    //console.log(this.props.id);
    return (
      <tr>
        <td>{this.props.id}</td>
        <td><Link to={'/adgroups/' + this.props.id}>{this.props.name}</Link></td>
        <td>{this.props.type}</td>
        <td>{formatPsDateTime(this.props.created_at, 'M/D/YYYY h:mma')}</td>
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
