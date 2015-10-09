import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { formatDate } from 'helpers/DateHelpers';

export default class AccountDetails extends Component {
  render() {
    const data = this.props.Account.details;

    let details;
    if (this.props.Account.isFetching === false) {
      details = (
        <div className="panel panel-default details-panel">
          <div className="panel-heading">
            <h2>{data.name}</h2>
            <Link to={'/accounts/' + data.id + '/edit/'} title="Edit">
              <span className="fa-stack fa-md">
                <i className="fa fa-square fa-stack-2x"></i>
                <i className="fa fa-pencil fa-stack-1x fa-inverse"></i>
              </span>
            </Link>
            <p className="text-muted">ID: {data.id}</p>
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
      details = <img src="./public/img/ajax-loader-navy.gif"/>;
    }

    return (<div>{details}</div>);
  }
}

AccountDetails.propTypes = {
  Account: PropTypes.object.isRequired
};
