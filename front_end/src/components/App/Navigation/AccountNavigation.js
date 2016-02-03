import React, { Component } from 'react';
import { Link } from 'react-router';

export default class AccountNavigation extends Component {
  render() {
    let accountActive = '';
    if(this.props.location.pathname.match(/\/accounts\/[0-9]{1,10}/)){
      accountActive = 'active';
    }

    let output = (<div/>);
    if(this.props.Account.details){
      output = (
        <div className="account-navigation">
          <div className="row">
            <div className={'col-xs-3 button ' + accountActive}><Link
              to={'/accounts/' + this.props.Account.details.id}>{this.props.Account.details.name}</Link></div>
            <div className="col-xs-3 button text-muted" >
              <a>Campaigns</a>
            </div>
            <div className="col-xs-3 button text-muted" >
              <a>Ad Groups</a>
            </div>
            <div className="col-xs-3 button text-muted" >
              <a>Tiles</a>
            </div>
          </div>
        </div>
      );
    }

    return output;
  }
}
