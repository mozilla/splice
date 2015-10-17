import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { formatDate } from 'helpers/DateHelpers';

import './AccountDetails.scss';

export default class AccountDetails extends Component {
  render() {
    const data = this.props.Account.details;

    let details;
    if (this.props.Account.isFetching === false) {
      details = (
        <div className="details-panel account-details">
          <div className="details-panel-header">
            <div className="table-cell">
              <h2 className="details-panel-name">{data.name}</h2>
              <div className="details-panel-id">ID: {data.id}</div>
            </div>
            <div className="details-edit-link">
              <Link className="" to={'/accounts/' + data.id + '/edit/'} title="Edit">
                  <i className="fa fa-pencil"></i>
              </Link>
            </div>
          </div>
          <div className="details-panel-body">
            <div className="row">
              <div className="col-xs-12">
                <div className="account-details-top">
                  <p><strong>Contact:</strong> {data.contact_name}</p>

                  <p><strong>Phone:</strong> {data.contact_phone}</p>

                  <p><strong>Email:</strong> {data.contact_email}</p>

                  <p><strong>Created:</strong> {formatDate(data.created_at, 'M/D/YYYY')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      details = <img src="./public/img/ajax-loader-navy.gif"/>;
    }

    return details;
  }
}

AccountDetails.propTypes = {
  Account: PropTypes.object.isRequired
};
