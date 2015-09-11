var webpack = require('webpack');

module.exports = function (config) {
  config.set({
    browsers: [ 'Firefox' ], //run in Chrome
    singleRun: false, //just run once by default
    frameworks: [ 'mocha' ], //use the mocha test framework
    files: [
      'tests.webpack.js' //just load this file
    ],
    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ] //preprocess with webpack and our sourcemap loader
    },
    reporters: [ 'dots' ], //report results in this format
    autoWatch: true,
    webpack: { //kind of a copy of your webpack config
        resolve: {
            alias: {
                'styles': __dirname + '/src/styles',
                'components': __dirname + '/src/components/',
                'reducers': __dirname + '/src/reducers/',
                'actions': __dirname + '/src/actions/',
                'constants': __dirname + '/src/constants/',
                'pages': __dirname + '/src/pages/'
            }
      },
      devtool: 'inline-source-map', //just do inline source maps instead of the default
      module: {
        loaders: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            loader: 'react-hot!babel'
        }, {
            test: /\.scss/,
            loader: 'style!css!autoprefixer!sass?outputStyle=expanded'
        }, {
            test: /\.css$/,
            exclude: [/\.raw\.css$/, /\.useable\.css$/, /node_module/],
            loader: 'style!css!autoprefixer'
        }, {
            test: /\.useable\.css$/,
            loader: 'style/useable!raw!autoprefixer'
        }, {
            test: /\.raw\.css$/,
            loader: 'style!raw!autoprefixer'
        }, {
            test: /\.(png|jpg|woff|woff2)$/,
            loader: 'url?limit=8192'
        }]
      }
    },
    webpackServer: {
      noInfo: true //please don't spam the console when running in karma!
    }
  });
};
