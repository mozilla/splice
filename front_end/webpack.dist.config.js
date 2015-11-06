/*
 * Webpack development server configuration
 *
 * This file is set up for serving the webpack-dev-server, which will watch for changes and recompile as required if
 * the subfolder /webpack-dev-server/ is visited. Visiting the root will not automatically reload.
 */
'use strict';
var webpack = require('webpack');
var assetPath = require('path').join(__dirname, 'dist');

var ExtractTextPlugin = require('extract-text-webpack-plugin');

import { webpack_resolve, webpack_modules_loaders, devApi, liveApi, devUrl, liveUrl } from './settings.conf.js';

module.exports = {

  output: {
    path: assetPath,
    filename: 'main.js',
    publicPath: liveUrl
  },
  progress: true,
  entry: [
    './src/main.js'
  ],

  stats: {
    colors: true,
    reasons: true
  },

  resolve: webpack_resolve,
  module: {
    loaders: webpack_modules_loaders
  },

  plugins: [
    new ExtractTextPlugin('public/css/styles.css'),
    new webpack.DefinePlugin({
      __DEVELOPMENT__: false,
      __DEVTOOLS__: false, // <-------- DISABLE redux-devtools HERE
      __DEVAPI__: devApi,
      __LIVEAPI__: liveApi
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]

};
