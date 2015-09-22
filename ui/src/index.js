import 'babel-core/polyfill';

import React from 'react';
import { Provider } from 'react-redux';
import Routes from './containers/Routes';
import configureStore from './store/configureStore';

const store = configureStore({
    selectedChannel: 'desktop',
    selectedLocale: null,
    selectedType: null,
    channels: {
        desktop: {
            name: 'Desktop',
            localeIndexUrl: 'https://tiles.cdn.mozilla.net/desktop_tile_index_v3.json',
            isFetching: false
        },
        prerelease: {
            name: 'Prerelease',
            localeIndexUrl: 'https://tiles.cdn.mozilla.net/desktop-prerelease_tile_index_v3.json',
            isFetching: false
        },
        android: {
            name: 'Android',
            localeIndexUrl: 'https://tiles.cdn.mozilla.net/android_tile_index_v3.json',
            isFetching: false
        }
    }
});

React.render(
  <Provider store={store}>
    {() => <Routes />}
  </Provider>,
  document.getElementById('root')
);
