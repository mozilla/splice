import React, { Component } from 'react';
import { Router, Route, Redirect } from 'react-router';
import App from './App'
import WebtilesPreviewer from './WebtilesPreviewer';
import Authoring from './Authoring';
import Upcoming from './Upcoming';

export default class Routes extends Component {
  render() {
    return (
      <Router>
        <Redirect from="/" to="/authoring" />
        <Route path="/" component={App}>
          <Route path="authoring" component={Authoring} />
          <Route path="upcoming" component={Upcoming} />
        </Route>
      </Router>
    );
  }
}
