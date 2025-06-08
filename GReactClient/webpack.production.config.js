const webpack = require('webpack');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// entry , "./src/action/auth.js", "./src/components/board/custom-size-per-page.js"
const config = {
  context: __dirname,
  entry: ['./src/index.js', 'babel-polyfill'],
  output: {
    // path: './dist/',
    path: '/var/www/html/',
    filename: 'index.js',
  },
  module: {
    // loaders handle the assets, like transforming sass to css or jsx to js.
    loaders: [{
      exclude: /node_modules/,
      test: /\.(js|jsx)$/,
      loader: 'babel',
      query: {
        presets: ['es2015', 'react'],
        plugins: ['transform-class-properties'],
      },
    }],
  },
  plugins: [
    new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify('production'),
      CLIENT_ROOT_URL: JSON.stringify('http://10.0.1.145'),
      API_URL: JSON.stringify('http://10.0.1.145/api'),
    } }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      output: { comments: false },
      // mangle: false,
      sourcemap: false,
      minimize: true,
      mangle: { except: ['$super', '$', 'exports', 'require', '$q', '$ocLazyLoad'] },
      compressor: {
        warnings: false,
        screw_ie8: true,
      },
    }),
    new CopyWebpackPlugin(
      [{ from: './assets', to: './assets' },
         { from: './index.html', to: './index.html' },
      ]),
  ],
};

module.exports = config;
