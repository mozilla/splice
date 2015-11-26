import React, { Component, PropTypes } from 'react';
import AccountRow from './AccountRow';

export default class AccountList extends Component {
  render() {
    let rows;
    let spinner;
    if (this.props.isFetching === false) {
      rows = this.props.rows.map((row, index) =>
          <AccountRow {...row} key={index}/>
      );
    } else {
      spinner = (<img src="./public/img/ajax-loader-navy.gif" />);
    }

    return (
      <div className="module">
        <table className="module-table data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
        {spinner}
      </div>
    );
  }
}

AccountList.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    contact_email: PropTypes.string.isRequired,
    contact_phone: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired
  }).isRequired).isRequired
};
