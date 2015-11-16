import React, { Component } from 'react';
import { Router, Route, Redirect } from 'react-router';
import App from './App'
import WebtilesPreviewer from './WebtilesPreviewer';

export default class Routes extends Component {
  render() {
    return (
      <Router>
        <Redirect from="/" to="/distributions" />
        <Route path="/" component={App}>
          <Route path="distributions" component={WebtilesPreviewer} />
        </Route>
      </Router>
    );
  }
}
