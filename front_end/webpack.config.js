/*
 * Webpack development server configuration
 *
 * This file is set up for serving the webpack-dev-server, which will watch for changes and recompile as required if
 * the subfolder /webpack-dev-server/ is visited. Visiting the root will not automatically reload.
 */
'use strict';
const webpack = require('webpack');

const assetPath = require('path').join(__dirname, 'dist');
const generateWebpack = require('./build_utils/generate-webpack');

// Note; this needs to export a function to work with gulp
module.exports = function (preset) {
  const isDevelop = preset === 'development';
  const config = require('./build_utils/load-config')({preset: preset});
  const webpackConfig = generateWebpack(config, {
    output: {
      path: assetPath,
      filename: 'main.js',
      publicPath: config.WEBPACK_PUBLIC_PATH
    },
    entry: [
      './src/main.js'
    ],

    cache: isDevelop,
    debug: isDevelop,

    stats: {
      colors: true,
      reasons: true
    }
  });

  if (isDevelop) {
    // Develop specific config
    webpackConfig.devtool = 'source-map';
    webpackConfig.entry = webpackConfig.entry.concat([
      'webpack-dev-server/client?http://localhost:9999',
      'webpack/hot/only-dev-server'
    ]);
    webpackConfig.plugins = webpackConfig.plugins.concat([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ]);

  } else {
    // Production config
    webpackConfig.plugins = webpackConfig.plugins.concat([
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]);
  }

  return webpackConfig;
};

