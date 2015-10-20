import 'babel-core/polyfill';

import React from 'react';
import { Provider } from 'react-redux';
import Routes from './containers/Routes';
import configureStore from './store/configureStore';

const store = configureStore({});

React.render(
  <Provider store={store}>
    {() => <Routes />}
  </Provider>,
  document.getElementById('root')
);
