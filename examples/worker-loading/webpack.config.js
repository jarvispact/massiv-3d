const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    main: path.resolve(__dirname, './index.ts'),
    worker: path.resolve(__dirname, './worker.ts'),
    worker2: path.resolve(__dirname, './worker2.ts'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, './'),
  },
  devServer: {
    contentBase: path.join(__dirname, './'),
    compress: true,
    port: 9000
  }
};