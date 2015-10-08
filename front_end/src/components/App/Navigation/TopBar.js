import React, { Component } from 'react';
import { Link } from 'react-router';

window.$ = require('jquery');

import SideBar from 'components/App/Navigation/SideBar.js';
import AccountNavigation from 'components/App/Navigation/AccountNavigation.js';
import BreadCrumbs from 'components/App/Navigation/BreadCrumbs.js';
import './TopBar.scss';

export default class TopBar extends Component {
  render() {
    const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

    let height = 40;
    if(this.showTabsAndBreadCrumbs()){
      height = 134;
    }

    return (
      <div className="fixed-navigation-container" style={{height: height}}>
        <div className="fixed-navigation" style={{position: 'fixed', zIndex: '1000', width: '100%'}}>
          <div className="header-bar">
            <div className="navigation-toggle" onClick={this.handleNavigationToggle}><i className="fa fa-bars"></i></div>
            <h1><Link to="/">SPLICE</Link></h1>
          </div>
          <SideBar {...this.props} />
          <div className="clearfix"></div>

          <ReactCSSTransitionGroup transitionName="fade" transitionAppear={true} transitionLeave={false}>
            {(this.showTabsAndBreadCrumbs() )
              ? (<div>
                   <AccountNavigation {...this.props} key="account-navigation"/>
                   <BreadCrumbs {...this.props} key="bread-crumbs"/>
                 </div>
              )
              : null }
          </ReactCSSTransitionGroup>
        </div>
      </div>
    );
  }

  showTabsAndBreadCrumbs(){
    return this.props.location.pathname.match(/\/accounts\/\d.*/) ||
      this.props.location.pathname.match(/\/campaigns\/.*/) ||
      this.props.location.pathname.match(/\/adgroups\/.*/) ||
      this.props.location.pathname.match(/\/tiles\/.*/);
  }

  handleNavigationToggle(){
    const display = $('.side-bar').css('display');
    if(display === 'none'){
      $('.side-bar').slideDown();
    }
    else{
      $('.side-bar').slideUp();
    }
  }
}
