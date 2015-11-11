var webpack = require('webpack');
var settings = require('./settings.conf.js');

var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function (config) {
  config.set({
    browsers: ['Firefox'], //run in Chrome
    singleRun: false, //just run once by default
    frameworks: ['mocha'], //use the mocha test framework
    files: [
      'tests.webpack.js' //just load this file
    ],
    preprocessors: {
      'tests.webpack.js': ['webpack'] //preprocess with webpack and our sourcemap loader
    },
    reporters: ['dots'], //report results in this format
    autoWatch: true,
    webpack: { //kind of a copy of your webpack config
      resolve: settings.webpack_resolve,
      module: {
        loaders: settings.webpack_modules_loaders
      },
      plugins: [
        new ExtractTextPlugin('public/css/styles.css'),
        new webpack.DefinePlugin({
          __DEVELOPMENT__: false,
          __DEVTOOLS__: false, // <-------- DISABLE redux-devtools HERE
          __DEVAPI__: settings.devApi,
          __LIVEAPI__: settings.liveApi
        })
      ]
    },
    webpackServer: {
      noInfo: true //please don't spam the console when running in karma!
    }
  });
};
