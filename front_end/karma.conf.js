var webpack = require('webpack');

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
			resolve: {
				extensions: ['', '.js', '.jsx'],
				alias: {
					'styles': __dirname + '/src/styles',
					'components': __dirname + '/src/components/',
					'reducers': __dirname + '/src/reducers/',
					'actions': __dirname + '/src/actions/',
					'constants': __dirname + '/src/constants/',
					'pages': __dirname + '/src/pages/'
				}
			},
			module: {
				loaders: [{
					test: /\.(js|jsx)$/,
					exclude: /node_modules/,
					loader: 'react-hot!babel'
				}, {
					test: /\.scss/,
					loader: 'style!css?sourceMap!autoprefixer!sass?outputStyle=expanded'
				}, {
					test: /\.css$/,
					exclude: [/\.raw\.css$/, /\.useable\.css$/],
					loader: 'style!css?sourceMap!autoprefixer'
				}, {
					test: /\.raw\.css$/,
					loader: 'style!raw!autoprefixer'
				}, {
					test: /\.(png|jpg|woff|woff2)$/,
					loader: 'url?limit=8192'
				}]
			},
			plugins: [
				new webpack.DefinePlugin({
					__DEVELOPMENT__: false,
					__DEVTOOLS__: false, // <-------- DISABLE redux-devtools HERE
					__DEVAPI__: "'http://tbg-staging-1.thebuddygroup.com:5000'",
					__LIVEAPI__: "'http://tbg-staging-1.thebuddygroup.com:5000'"
				})
			]
		},
		webpackServer: {
			noInfo: true //please don't spam the console when running in karma!
		}
	});
};
