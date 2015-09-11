import React, { Component } from 'react';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import loggerMiddleware from 'redux-logger';
import { Provider } from 'react-redux';

import * as reducers from './reducers';
import Routes from './Routes.js';

require('./styles/main.scss');

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
					{() => <Routes history={history}/>}
				</Provider>
				{devtools}
			</div>
		);
	}
}

React.render(<App />, document.body);
