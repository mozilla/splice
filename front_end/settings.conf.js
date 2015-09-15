exports.devApi = "'http://tbg-staging-1.thebuddygroup.com:5000'";
exports.liveApi = "'http://tbg-staging-1.thebuddygroup.com:5000'";
exports.development = true;
exports.devTools = false;

exports.webpack_modules_loaders =
	[{
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

