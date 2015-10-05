import React, { Component } from 'react';
import { Link } from 'react-router';

export default class App extends Component {
  render () {
    return (
      <div id="page">
        <div id="header">
          <div id="nav">
            <ul>
              <li>Firefox Tiles</li>
              <li><Link to="/authoring">Authoring</Link></li>
              <li><Link to="/upcoming">Upcoming</Link></li>
            </ul>
          </div>
        </div>
        <div id="view">
          {this.props.children}
        </div>
      </div>
    );
  }
}

App.propTypes = {
  children : React.PropTypes.element
};
