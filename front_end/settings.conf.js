exports.devApi = "'http://tbg-staging-1.thebuddygroup.com:5000'";
exports.liveApi = "'http://tbg-staging-1.thebuddygroup.com:5000'";
exports.development = true;
exports.devTools = false;

exports.webpack_modules_loaders =
	[
	// **IMPORTANT** This is needed so that each bootstrap js file required by
		// bootstrap-webpack has access to the jQuery object
		{ test: /bootstrap\/js\//, loader: 'imports?jQuery=jquery' },

		// Needed for the css-loader when [bootstrap-webpack](https://github.com/bline/bootstrap-webpack)
		// loads bootstrap's css.
		{ test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,   loader: "file?name=public/fonts/[name].[ext]" },
		{ test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,   loader: "file?name=public/fonts/[name].[ext]" },
		{ test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: "file?name=public/fonts/[name].[ext]" },
		{ test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: "file?name=public/fonts/[name].[ext]" },
		{ test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: "file?name=public/fonts/[name].[ext]" },
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

