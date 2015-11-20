import React, { Component } from 'react';
import { Link } from 'react-router';

window.$ = require('jquery');

import SideBar from 'components/App/Navigation/SideBar.js';
import AccountNavigation from 'components/App/Navigation/AccountNavigation.js';
import BreadCrumbs from 'components/App/Navigation/BreadCrumbs.js';
import Timeline from 'components/App/Navigation/Timeline.js';
import './TopBar.scss';
import './HamburgerIcon.scss';

import Ps from 'perfect-scrollbar';

export default class TopBar extends Component {
  componentDidMount(){
    $(window).scroll(function(){
      $('.fixed-navigation').css('top', $(window).scrollTop());
    });
  }

  render() {
    const ReactCSSTransitionGroup = require('react-addons-css-transition-group');

    let height = 50;
    if(this.showTimeline()) {
      height = 110;
    }
    else if(this.showTabsAndBreadCrumbs()){
      height = 134;
    }

    return (
      <div className="fixed-navigation-container" style={{height: height}}>
        <div className="fixed-navigation">
          <div className="header-bar">
            <div className="navigation-toggle" onClick={this.handleNavigationToggle}>
              <button className="c-hamburger c-hamburger--htx">
                <span>toggle menu</span>
              </button>
            </div>
            <h1><Link to="/">SPLICE</Link></h1>
          </div>
          <SideBar {...this.props} />
          <div className="clearfix"></div>

          <ReactCSSTransitionGroup transitionName="fade" transitionAppearTimeout={300} transitionEnterTimeout={300} transitionLeave={false} transitionLeaveTimeout={0}>
            {this.showBar()}
          </ReactCSSTransitionGroup>
        </div>
      </div>
    );
  }

  showBar(){
    let output;

    if(this.showTimeline()){
      output = (
        <div key="timeline-container">
          <Timeline {...this.props} key="timeline" />
        </div>
      );
    }
    else if(this.showTabsAndBreadCrumbs()){
      output = (
        <div key="tabs-and-breadcrumbs">
          <AccountNavigation {...this.props} key="account-navigation"/>
          <BreadCrumbs {...this.props} key="breadcrumbs"/>
        </div>
      );
    }

    return output;
  }

  showTabsAndBreadCrumbs(){
    return this.props.location.pathname.match(/\/accounts\/[0-9]{1,10}.*/) ||
      this.props.location.pathname.match(/\/campaigns\/[0-9]{1,10}.*/) ||
      this.props.location.pathname.match(/\/adgroups\/[0-9]{1,10}.*/) ||
      this.props.location.pathname.match(/\/tiles\/[0-9]{1,10}.*/);
  }

  showTimeline(){
    return this.props.location.pathname.match(/\/accounts\/create/) ||
      this.props.location.pathname.match(/\/accounts\/[0-9]{1,10}\/edit/) ||
      this.props.location.pathname.match(/\/accounts\/[0-9]{1,10}\/createcampaign/) ||
      this.props.location.pathname.match(/\/campaigns\/create/) ||
      this.props.location.pathname.match(/\/campaigns\/[0-9]{1,10}\/edit/) ||
      this.props.location.pathname.match(/\/campaigns\/[0-9]{1,10}\/createadgroup/) ||
      this.props.location.pathname.match(/\/campaigns\/[0-9]{1,10}\/bulkupload/) ||
      this.props.location.pathname.match(/\/adgroups\/create/) ||
      this.props.location.pathname.match(/\/adgroups\/[0-9]{1,10}\/edit/) ||
      this.props.location.pathname.match(/\/adgroups\/[0-9]{1,10}\/createtile/) ||
      this.props.location.pathname.match(/\/tiles\/create/) ||
      this.props.location.pathname.match(/\/tiles\/[0-9]{1,10}\/edit/);
  }

  handleNavigationToggle(){
    const display = $('.side-bar').css('display');

    if(display === 'none'){
      $('.side-bar').slideDown();
      $('.c-hamburger').addClass('is-active');

      Ps.update($('.accounts-list').get(0));
    }
    else{
      $('.side-bar').slideUp();
      $('.c-hamburger').removeClass('is-active');
    }
  }
}
