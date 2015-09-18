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

import { webpack_resolve, webpack_modules_loaders, devApi, liveApi, development, devTools, devUrl, liveUrl } from './settings.conf.js';

module.exports = {

	output: {
		path: assetPath,
		filename: 'main.js',
		publicPath: 'http://localhost:9999/'
	},

	cache: true,
	debug: true,
	devtool: 'source-map',
	entry: [
		'webpack-dev-server/client?http://localhost:9999',
		'webpack/hot/only-dev-server',
		'./src/main.js'
	],

	stats: {
		colors: true,
		reasons: true
	},

	resolve: webpack_resolve,
	module: {
		preLoaders: [{
			test: /\.(js|jsx)$/,
			exclude: [/node_module/, 'server.js', 'mock/*'],
			loader: 'eslint'
		}],
		loaders: webpack_modules_loaders
	},

	plugins: [
		new ExtractTextPlugin('public/css/styles.css'),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
		new webpack.DefinePlugin({
			__DEVELOPMENT__: development,
			__DEVTOOLS__: devTools,  // <-------- DISABLE redux-devtools HERE
			__DEVAPI__: devApi,
			__LIVEAPI__: liveApi
		})
	]
};
