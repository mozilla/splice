import React, { Component } from 'react';
import { Link } from 'react-router';

import $ from 'jquery';
import './SideBar.scss';

export default class SideBar extends Component {
  componentDidMount(){
    $(document).on('click', '.side-bar a', function(){
      $('.side-bar').slideUp();
    });

    let maxHeight;
    $(window).resize(function(){
      let h;
      const app = $('.app-container');
      if(window.innerHeight > app.outerHeight() ){
        h = window.innerHeight;
      }
      else{
        h = app.outerHeight();
      }

      maxHeight = h - ($('.top-bar .navigation-toggle').outerHeight() + $('.side-bar .create').outerHeight() + $('.side-bar .approval').outerHeight() );
      $('.accounts-list').css('max-height', maxHeight);
    });
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

        <div className="create button text-center"><Link to="/accounts/create">Create <i className="fa fa-plus"></i></Link></div>
        <div className="approval button text-center"><Link to={'/approvals'} >Approval Queue <i className="fa fa-check"></i></Link></div>
      </div>
    );
  }
}
