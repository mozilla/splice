import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { formatDate } from 'helpers/DateHelpers';

export default class AccountDetails extends Component {
  render() {
    const data = this.props.Account.details;

    let details;
    if (this.props.Account.isFetching === false) {
      details = (
        <div className="panel panel-default">
          <div className="panel-heading">{data.name}
            <Link to={'/accounts/' + data.id + '/edit/'}> <i className="fa fa-pencil"></i></Link>
            <p>ID: {data.id}</p>
          </div>
          <div className="panel-body">
            <p><strong>Contact:</strong> {data.contact_name}</p>

            <p><strong>Phone:</strong> {data.contact_phone}</p>

            <p><strong>Email:</strong> {data.contact_email}</p>

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

AccountDetails.propTypes = {
  Account: PropTypes.object.isRequired
};
