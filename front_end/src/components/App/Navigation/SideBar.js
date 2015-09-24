import React, { Component } from 'react';
import { Link } from 'react-router';

export default class SideBar extends Component {
  render() {
    const props = this.props;
    let accountLinks = [];
    if (_.isEmpty(this.props.Account.rows) === false) {
      this.props.Account.rows.map(function loop(row, index) {
        let className = '';
        if (props.location.pathname === ('/accounts/' + row.id)) {
          className = 'active';
        }
        accountLinks.push(
          <li key={'sidebar-' + index} className={className}><Link to={'/accounts/' + row.id }>{row.name}</Link></li>
        );
      });
    } else {
      accountLinks = '';
    }

    return (
      <div className="sidebar col-xs-2">
        <div>
          Accounts
          <ul className="nav nav-pills nav-stacked">
            {accountLinks}
          </ul>
        </div>

        <div> Create +</div>
        <div> Approval Queue</div>
      </div>
    );
  }
}
