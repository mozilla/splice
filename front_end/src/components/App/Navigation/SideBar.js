import React, { Component } from 'react';
import { Link } from 'react-router';

import Ps from 'perfect-scrollbar';
require('perfect-scrollbar/dist/css/perfect-scrollbar.min.css');

window.$ = require('jquery');
import './SideBar.scss';

export default class SideBar extends Component {
  componentDidMount(){
    $(document).on('click', '.side-bar a', function(){
      $('.side-bar').slideUp();
    });

    const context = this;
    $(window).resize(function(){
      context.handleResize();
    });
    this.handleResize();

    Ps.initialize($('.accounts-list').get(0));
  }

  render() {
    const props = this.props;
    let accountLinks = [];
    if (_.isEmpty(this.props.Account.rows) === false) {
      this.props.Account.rows.map(function(row, index) {
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
      <div className="side-bar">
        <div className="accounts-list">
          <ul className="">
            {accountLinks}
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
            <li><a>Account</a></li>
          </ul>
        </div>

        <div className="create button"><Link to="/accounts/create">Create <i className="fa fa-plus"></i></Link></div>
        <div className="approval button"><Link to={'/approvals'} >Approval Queue <i className="fa fa-check"></i></Link></div>
      </div>
    );
  }

  handleResize(){
    const h = window.innerHeight;

    const maxHeight = h - 168;
    $('.accounts-list').css('max-height', maxHeight);
  }
}
