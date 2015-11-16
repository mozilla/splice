import React, { Component } from 'react';
import { Link } from 'react-router';

export default class App extends Component {
  render () {
    return (
      <div id="page">
        <div id="header">
          <div id="nav">
            <ul>
              <li><span>Firefox Tiles</span></li>
              <li><Link to="/distributions" activeClassName="active">Distributions</Link></li>
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
