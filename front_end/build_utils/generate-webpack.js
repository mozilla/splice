const webpack = require('webpack');
const path = require('path');
const absolute = function (relPath) {
  return path.join(__dirname, '../', relPath);
};
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
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: 'react-hot!babel'
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({__CONFIG__: JSON.stringify(config)})
    ]
  }, extension);
}
