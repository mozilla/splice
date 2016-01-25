import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import del from 'del';
import RunSequnence from 'run-sequence';

import webpackConfig from './webpack.config';

var rename = require("gulp-rename");

const $ = gulpLoadPlugins();
let options = {};

// run webpack bundler
gulp.task('bundle', (cb) => {
  const config = webpackConfig('production');
  const bundler = webpack(config);

  function bundlerCallback(err, stats) {
    console.log(stats.toString());
  }

  if (options.watch) {
    bundler.watch(200, bundlerCallback);
  } else {
    bundler.run(bundlerCallback);
  }
});

gulp.task('bundle:dist', (cb) => {
  options.dist = true;
  RunSequnence('bundle', cb);
});

gulp.task('serve', () => {
  const config = webpackConfig('development');
  const bundler = webpack(config);
  let server = new WebpackDevServer(bundler, {
    contentBase: './dist',
    publicPath: '/',
    hot: true,
    stats: {
      colors: true
    },
    historyApiFallback: false
  });
  server.listen(9999, 'localhost', (err) => {
    console.log('server listen at 9999');
  });
});
