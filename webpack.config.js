const webpack = require('webpack')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new CopyWebpackPlugin([
            { from: 'src/assets/index.html', to: '.' },
            { from: 'src/assets/main.css', to: '.' },
            { from: 'src/assets/test.html', to: '.' },
            { from: 'src/assets/p5.min.js', to: '.' }
    ])
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    https: true
  }
}
