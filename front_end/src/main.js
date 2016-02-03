import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { combineReducers } from 'redux';
import { Provider } from 'react-redux';

import _ from 'lodash';

import * as reducers from './reducers';
import Routes from './routes.js';
import * as config from 'helpers/config';

import { finalCreateStore } from './finalCreateStore';

const reducer = combineReducers(reducers);
const store = finalCreateStore(reducer);

export default class App extends Component {
  render() {
    let devtools = null;
    if (config.get('DEVTOOLS')) {
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
