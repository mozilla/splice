exports.devApi = "'http://tbg-staging-1.thebuddygroup.com:5000'";
exports.liveApi = "'http://tbg-staging-1.thebuddygroup.com:5000'";
exports.devUrl = "http://localhost:9999/";
exports.liveUrl = "http://dev.splice.com/";
exports.development = true;
exports.devTools = false;

var ExtractTextPlugin = require('extract-text-webpack-plugin');

exports.webpack_modules_loaders =
	[
		// bootstrap-webpack needs to import jquery as a dependency
		{ test: /bootstrap\/js\//, loader: 'imports?jQuery=jquery' },

		// Needed to load font files for bootstrap and font-awesome
		{ test: /fonts.*\.woff2(\?v=\d+\.\d+\.\d+)?$/,   loader: "file?name=public/fonts/[name].[ext]" },
		{ test: /fonts.*\.woff(\?v=\d+\.\d+\.\d+)?$/,   loader: "file?name=public/fonts/[name].[ext]" },
		{ test: /fonts.*\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: "file?name=public/fonts/[name].[ext]" },
		{ test: /fonts.*\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: "file?name=public/fonts/[name].[ext]" },
		{ test: /fonts.*\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: "file?name=public/fonts/[name].[ext]" },
		{ test: /\.(png|jpg|gif)$/,    loader: "file?name=public/img/[name].[ext]" },
	{
		test: /\.(js|jsx)$/,
		exclude: /node_modules/,
		loader: 'react-hot!babel'
	}, {
		test: /\.scss/,
		loader: ExtractTextPlugin.extract('css?sourceMap!autoprefixer!sass?sourceMap')

	}, {
		test: /\.css$/,
		exclude: [/\.raw\.css$/, /\.useable\.css$/],
		loader: 'style!css?sourceMap!autoprefixer'
	}, {
		test: /\.raw\.css$/,
		loader: 'style!raw!autoprefixer'
	}];

exports.webpack_resolve = {
	extensions: ['', '.js', '.jsx'],
	alias: {
		'styles': __dirname + '/src/styles',
		'components': __dirname + '/src/components/',
		'reducers': __dirname + '/src/reducers/',
		'actions': __dirname + '/src/actions/',
		'constants': __dirname + '/src/constants/',
		'pages': __dirname + '/src/pages/',
		'helpers': __dirname + '/src/helpers/'
	}
};

