import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { combineReducers } from 'redux';
import { Provider } from 'react-redux';

import _ from 'lodash';

import * as reducers from './reducers';
import Routes from './routes.js';

import './styles/main.scss';

require('bootstrap-webpack');
require('font-awesome/css/font-awesome.min.css');

import { finalCreateStore } from './finalCreateStore';

const reducer = combineReducers(reducers);
const store = finalCreateStore(reducer);

export default class App extends Component {
  render() {
    let devtools = null;
    if (typeof __DEVTOOLS__ !== 'undefined' && __DEVTOOLS__ === true) {
      const { DevTools, DebugPanel, LogMonitor } = require('redux-devtools/lib/react');
      devtools = (
        <DebugPanel top right bottom>
          <DevTools store={store}
                    monitor={LogMonitor}/>
        </DebugPanel>
      );
    }

    return (
      <div>
        <Provider store={store}>
          <Routes />
        </Provider>
        {devtools}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('content'));
