const webpack = require('webpack');
const generateWebpack = require('./build_utils/generate-webpack');
const appConfig = require('./build_utils/load-config')({preset: 'test', allowOverride: false});

const webpackConfig = generateWebpack(appConfig);

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
    webpack: webpackConfig,
    webpackServer: {
      noInfo: true //please don't spam the console when running in karma!
    }
  });
};
