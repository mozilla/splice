exports.devApi = "'http://tbg-staging-1.thebuddygroup.com:5000'";
exports.liveApi = "'http://tbg-staging-1.thebuddygroup.com:5000'";
exports.development = true;
exports.devTools = false;

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
	{
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
	}];

exports.webpack_resolve = {
	extensions: ['', '.js', '.jsx'],
	alias: {
		'styles': __dirname + '/src/styles',
		'components': __dirname + '/src/components/',
		'reducers': __dirname + '/src/reducers/',
		'actions': __dirname + '/src/actions/',
		'constants': __dirname + '/src/constants/',
		'pages': __dirname + '/src/pages/'
	}
};

