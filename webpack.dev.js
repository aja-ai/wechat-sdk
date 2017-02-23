const join = require('path').join
const webpack = require('webpack')

module.exports = {

  entry: {
    main: [
      'webpack-hot-middleware/client',
      'normalize.css',
      './src/styles/main.scss',
    ],
  },

  devtool: 'inline-source-map',

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
        use: [ 'style-loader', 'css-loader', 'postcss-loader', 'sass-loader' ],
      },
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],

}
