import React, { Component } from 'react';
import { Link } from 'react-router';

import './AccountNavigation.scss';

export default class AccountNavigation extends Component {
  render() {
    let accountActive = '';
    if(this.props.location.pathname.match(/\/accounts\/\d/)){
      accountActive = 'active';
    }

    return (
      <div className="account-navigation">
        <div className="row">
          <div className={'col-xs-3 button ' + accountActive}><Link
            to={'/accounts/' + this.props.Account.details.id}>{this.props.Account.details.name}</Link></div>
          <div className="col-xs-3 button text-muted" >Campaigns</div>
          <div className="col-xs-3 button text-muted" >Ad Groups</div>
          <div className="col-xs-3 button text-muted" >Tiles</div>
          {/*
          <li className={(false) ? 'active' : ''}><Link
            to={'/campaigns?accountId=' + accountId}>Campaigns</Link></li>
          <li className={(false) ? 'active' : ''}><Link
            to={'/adgroups?accountId=' + accountId}>Ad Groups</Link></li>
          <li className={(false) === '/tiles' ? 'active' : ''}><Link
            to={'/tiles?accountId=' + accountId}>Tiles</Link></li>
            */
          }
        </div>
      </div>
    );
  }
}
