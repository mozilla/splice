'use strict';
const webpack = require('webpack');
const path = require('path');
const absolute = (relPath) => path.join(__dirname, '../', relPath);
const assign = require('lodash').assign;

// Generates a webpack configuration given:
// config: a configuration object
// extension: an object of extra fields to add to the object
module.exports = function generateWebpack(config, extension) {
  extension = extension || {};

  const sourceMap = config.ENV === 'development' ? 'sourceMap' : '';

  return assign({
    resolve: {
      extensions: ['', '.js', '.jsx'],
      alias: {
        'styles': absolute('./src/styles'),
        'components': absolute('./src/components'),
        'reducers': absolute('./src/reducers'),
        'actions': absolute('./src/actions'),
        'constants': absolute('./src/constants'),
        'pages': absolute('./src/pages'),
        'helpers': absolute('./src/helpers')
      }
    },
    module: {
      preLoaders: [{
        test: /\.(js|jsx)$/,
        exclude: [/node_module/, 'server.js', 'mock/*', /build_utils/],
        loader: 'eslint'
      }],
      loaders: [
        // bootstrap-webpack needs to import jquery as a dependency
        {test: /bootstrap\/js\//, loader: 'imports?jQuery=jquery'},

        // Needed to load font files for bootstrap and font-awesome
        {test: /fonts.*\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=public/fonts/[name].[ext]"},
        {test: /fonts.*\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=public/fonts/[name].[ext]"},
        {test: /fonts.*\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=public/fonts/[name].[ext]"},
        {test: /fonts.*\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=public/fonts/[name].[ext]"},
        {test: /fonts.*\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=public/fonts/[name].[ext]"},
        {test: /\.(png|jpg|gif)$/, loader: "file?name=public/img/[name].[ext]"},
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: 'react-hot!babel'
        }, {
          test: /\.scss/,
          loader: `style!css?${sourceMap}!autoprefixer!sass?${sourceMap}`

        }, {
          test: /\.css$/,
          exclude: [/\.raw\.css$/, /\.useable\.css$/],
          loader: `style!css?${sourceMap}!autoprefixer`
        }, {
          test: /\.raw\.css$/,
          loader: 'style!raw!autoprefixer'
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({__CONFIG__: JSON.stringify(config)})
    ]
  }, extension);
}
