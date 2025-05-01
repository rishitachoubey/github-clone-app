const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: './public/index.html' }),
  new webpack.DefinePlugin({
    'process.env.REACT_APP_GITHUB_TOKEN': JSON.stringify(process.env.REACT_APP_GITHUB_TOKEN),
  })
],
  devServer: {
    static: './dist',
    port: 3000,
  },
};
