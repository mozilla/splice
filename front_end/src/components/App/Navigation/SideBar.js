import React, { Component } from 'react';
import { Link } from 'react-router';

import Ps from 'perfect-scrollbar';
require('perfect-scrollbar/dist/css/perfect-scrollbar.min.css');

window.$ = require('jquery');
import './SideBar.scss';

export default class SideBar extends Component {
  componentDidMount(){
    $(document).on('click', '.accounts-list a, .submenu a', function(){
      $('.side-bar').slideUp();
      $('.c-hamburger').removeClass('is-active');
    });

    $(document).on('mouseover', '.button.create', function(){
      $('.side-bar .submenu').css('top', 0);

      const subH = $('.side-bar .submenu').height();
      const subT = $('.side-bar .submenu').offset().top;
      const windowH = $(window).height();

      if((subH + subT) > windowH){
        $('.side-bar .submenu').css('top', (windowH + $(window).scrollTop()) - (subH + subT) );
      }
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
          </ul>
        </div>

        <div className="create button">
          <a> Create <i className="fa fa-plus"></i> </a>

          <ul className="submenu">
            <li><Link to="/accounts/create">Account</Link></li>
            <li><Link to="/campaigns/create">Campaign</Link></li>
            <li><Link to="/adgroups/create">Ad Group</Link></li>
            <li><Link to="/tiles/create">Tile</Link></li>
          </ul>
        </div>
        {/*<div className="approval button"><Link to={'/approvals'} >Approval Queue <i className="fa fa-check"></i></Link></div>*/}
      </div>
    );
  }

  handleResize(){
    const h = window.innerHeight;

    //const maxHeight = h - 168;
    const maxHeight = h - 109;
    $('.accounts-list').css('max-height', maxHeight);
  }
}
