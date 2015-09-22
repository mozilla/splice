import React, { Component } from 'react';
import { Router, Route, IndexRoute } from 'react-router';
import App from './App'
import WebtilesPreviewer from './WebtilesPreviewer';
import Authoring from './Authoring';
import Upcoming from './Upcoming';

export default class Routes extends Component {
  render() {
    return (
      <Router>
        <Route path="/" component={App}>
          <IndexRoute component={WebtilesPreviewer} />
          <Route path="authoring" component={Authoring} />
          <Route path="upcoming" component={Upcoming} />
        </Route>
      </Router>
    );
  }
}
