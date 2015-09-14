var webpack = require('webpack');

import { webpack_resolve, webpack_modules_loaders, devApi, liveApi } from './settings.conf.js';

module.exports = function (config) {
	config.set({
		browsers: ['Firefox'], //run in Chrome
		singleRun: false, //just run once by default
		frameworks: ['mocha'], //use the mocha test framework
		files: [
			'tests.webpack.js' //just load this file
		],
		preprocessors: {
			'tests.webpack.js': ['webpack', 'sourcemap'] //preprocess with webpack and our sourcemap loader
		},
		reporters: ['dots'], //report results in this format
		autoWatch: true,
		webpack: { //kind of a copy of your webpack config
			devtool: 'inline-source-map', //just do inline source maps instead of the default
			resolve: webpack_resolve,
			module: {
				loaders: webpack_modules_loaders
			},
			plugins: [
				new webpack.DefinePlugin({
					__DEVELOPMENT__: false,
					__DEVTOOLS__: false, // <-------- DISABLE redux-devtools HERE
					__DEVAPI__: devApi,
					__LIVEAPI__: liveApi
				})
			]
		},
		webpackServer: {
			noInfo: true //please don't spam the console when running in karma!
		}
	});
};
