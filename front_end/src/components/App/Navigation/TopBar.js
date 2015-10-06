import React, { Component } from 'react';
import { Link } from 'react-router';

window.$ = require('jquery');

import SideBar from 'components/App/Navigation/SideBar.js';
import './TopBar.scss';

export default class TopBar extends Component {
  render() {
    return (
      <div>
        <div className="top-bar">
          <div className="navigation-toggle" onClick={this.handleNavigationToggle}><i className="fa fa-bars"></i></div>
          <h1><Link to="/">SPLICE</Link></h1>
        </div>
        <SideBar {...this.props} />
      </div>
    );
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
