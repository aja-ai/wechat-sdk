const join = require('path').join
const webpack = require('webpack')

const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {

  entry: {
    main: [
      'normalize.css',
      './src/styles/main.scss',
    ],
  },

  output: {
    path: join(__dirname, 'dist', 'assets'),
    publicPath: '/assets/',
    filename: '[name].js',
  },

  resolve: {
    extensions: [ '.js', '.css', '.scss' ]
  },

  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true,
              },
            },
            { loader: 'postcss-loader' },
            { loader: 'sass-loader' },
          ],
        }),
      },
    ]
  },

  plugins: [
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true,
    }),
    new webpack.optimize.UglifyJsPlugin({
      output: { comments: false }
    }),
  ],

}
